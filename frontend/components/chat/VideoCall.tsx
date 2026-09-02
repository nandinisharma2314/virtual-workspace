import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2, Users, MonitorUp, StopCircle, MessageSquare, Send, Paperclip, Lock, Unlock, Download, Sparkles, ClosedCaption, Hand, Smile, MoreVertical, Info, LayoutTemplate, Shapes, ShieldAlert, MonitorPlay } from 'lucide-react';
import Avatar from '@/components/Avatar';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';

interface VideoCallProps {
  socket: Socket | null;
  channelId: string;
  currentUser: any;
  onClose: () => void;
  isInitiator?: boolean;
  initialOffer?: any;
  channelMembers?: any[];
}

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export default function VideoCall({ socket, channelId, currentUser, onClose, isInitiator = false, initialOffer, channelMembers = [] }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded for multi-party
  const [activeTab, setActiveTab] = useState<'video' | 'participants' | 'chat' | 'effects'>('video');
  const [activeEffect, setActiveEffect] = useState<'none' | 'blur'>('none');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLocked, setIsChatLocked] = useState(false);
  const isAdmin = currentUser?.role === "Admin";
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // State for remote streams
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  // Store peer connections manually, using state or ref. Ref is safer to avoid stale closures.
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  // Background Blur Refs
  const rawVideoRef = useRef<HTMLVideoElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const blurLoopRef = useRef<number>(0);
  const segmenterRef = useRef<any>(null);
  const isSegmenterLoading = useRef(false);

  // Helper to trigger re-render when remoteStreams change
  const addRemoteStream = useCallback((id: string, stream: MediaStream) => {
    setRemoteStreams(prev => {
      const next = new Map(prev);
      next.set(id, stream);
      return next;
    });
  }, []);

  const removeRemoteStream = useCallback((id: string) => {
    setRemoteStreams(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const createPeerConnection = useCallback((targetId: string) => {
    if (!socket || !currentUser) return null;
    if (peersRef.current.has(targetId)) return peersRef.current.get(targetId);

    const pc = new RTCPeerConnection(configuration);
    peersRef.current.set(targetId, pc);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        addRemoteStream(targetId, event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc_ice_candidate', {
          channelId,
          candidate: event.candidate,
          senderId: currentUser.sub,
          targetId
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        removeRemoteStream(targetId);
        peersRef.current.delete(targetId);
      }
    };

    return pc;
  }, [socket, channelId, currentUser, addRemoteStream, removeRemoteStream]);

  useEffect(() => {
    if (!socket || !currentUser) return;

    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Announce we joined the call
        socket.emit('join_video_call', {
          channelId,
          senderId: currentUser.sub,
          senderName: currentUser.name
        });

        // If we have an initial offer (from a direct invite or ringing), process it
        if (initialOffer && initialOffer.senderId) {
          const pc = createPeerConnection(initialOffer.senderId);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(initialOffer.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc_answer', {
              channelId,
              answer,
              senderId: currentUser.sub,
              targetId: initialOffer.senderId
            });
          }
        }
      } catch (err: any) {
        if (err.name !== 'NotAllowedError' && !err.message?.includes('Permission')) {
          console.error("Error accessing media devices.", err);
        }
        if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
          setPermissionError("Camera/Microphone permissions were denied. Please allow them in your browser settings to join the call.");
        } else {
          setPermissionError("Failed to start video call. " + (err.message || ""));
        }
      }
    };

    startCall();

    // Socket listeners
    const handleUserJoined = async (payload: { senderId: string, senderName: string }) => {
      if (payload.senderId === currentUser.sub) return;
      // When a new user joins, WE create an offer to them
      const pc = createPeerConnection(payload.senderId);
      if (pc) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc_offer', {
          channelId,
          offer,
          senderId: currentUser.sub,
          targetId: payload.senderId
        });
      }
    };

    const handleOffer = async (payload: { offer: any, senderId: string, targetId: string }) => {
      if (payload.targetId !== currentUser.sub) return;
      
      const pc = createPeerConnection(payload.senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc_answer', {
          channelId,
          answer,
          senderId: currentUser.sub,
          targetId: payload.senderId
        });
      }
    };

    const handleAnswer = async (payload: { answer: any, senderId: string, targetId: string }) => {
      if (payload.targetId !== currentUser.sub) return;
      const pc = peersRef.current.get(payload.senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
      }
    };

    const handleIceCandidate = async (payload: { candidate: any, senderId: string, targetId: string }) => {
      if (payload.targetId !== currentUser.sub) return;
      const pc = peersRef.current.get(payload.senderId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
    };

    const handleInCallMessage = (payload: any) => {
      setChatMessages(prev => [...prev, payload]);
    };

    const handleInCallFile = (payload: any) => {
      setChatMessages(prev => [...prev, payload]);
    };

    const handleToggleChat = (payload: { isEnabled: boolean }) => {
      setIsChatLocked(!payload.isEnabled);
    };

    socket.on('join_video_call', handleUserJoined);
    socket.on('webrtc_offer', handleOffer);
    socket.on('webrtc_answer', handleAnswer);
    socket.on('webrtc_ice_candidate', handleIceCandidate);
    socket.on('in_call_message', handleInCallMessage);
    socket.on('in_call_file', handleInCallFile);
    socket.on('toggle_in_call_chat', handleToggleChat);

    return () => {
      socket.off('join_video_call', handleUserJoined);
      socket.off('webrtc_offer', handleOffer);
      socket.off('webrtc_answer', handleAnswer);
      socket.off('webrtc_ice_candidate', handleIceCandidate);
      socket.off('in_call_message', handleInCallMessage);
      socket.off('in_call_file', handleInCallFile);
      socket.off('toggle_in_call_chat', handleToggleChat);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
      }
      peersRef.current.forEach(pc => pc.close());
      peersRef.current.clear();
    };
  }, [socket, channelId, currentUser, createPeerConnection, initialOffer]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share and revert to camera
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        peersRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && videoTrack) sender.replaceTrack(videoTrack);
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;
        
        screenTrack.onended = () => {
          toggleScreenShare(); // revert if stopped via browser UI
        };

        peersRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        if (localVideoRef.current) {
          // Create a temporary stream for local playback so we see what we share
          const displayStream = new MediaStream([screenTrack]);
          localVideoRef.current.srcObject = displayStream;
        }

        setIsScreenSharing(true);
      } catch (e: any) {
        if (e.name !== 'NotAllowedError') {
          console.error("Failed to share screen", e);
        }
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Load Segmentation Model
  useEffect(() => {
    const initSegmenter = async () => {
      if (segmenterRef.current || isSegmenterLoading.current) return;
      isSegmenterLoading.current = true;
      try {
        await tf.ready();
        segmenterRef.current = await bodyPix.load();
      } catch (e) {
        console.error("Failed to load segmenter", e);
      }
      isSegmenterLoading.current = false;
    };
    initSegmenter();
  }, []);

  // Background Blur Processing Loop
  useEffect(() => {
    if (activeEffect === 'blur') {
      const processFrame = async () => {
        if (
          !rawVideoRef.current || 
          !processedCanvasRef.current || 
          !segmenterRef.current || 
          rawVideoRef.current.readyState < 2
        ) {
          blurLoopRef.current = requestAnimationFrame(processFrame);
          return;
        }

        const video = rawVideoRef.current;
        const canvas = processedCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        try {
          const segmentation = await segmenterRef.current.segmentPerson(video);
          bodyPix.drawBokehEffect(
            canvas, video, segmentation, 12, 5, false
          );
        } catch (e) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        blurLoopRef.current = requestAnimationFrame(processFrame);
      };

      blurLoopRef.current = requestAnimationFrame(processFrame);
    } else {
      if (blurLoopRef.current) cancelAnimationFrame(blurLoopRef.current);
    }

    return () => {
      if (blurLoopRef.current) cancelAnimationFrame(blurLoopRef.current);
    };
  }, [activeEffect]);

  // Effect Stream Replacement
  useEffect(() => {
    if (!localStreamRef.current) return;
    
    let trackToSend: MediaStreamTrack;

    if (activeEffect === 'blur' && processedCanvasRef.current) {
      const canvasStream = (processedCanvasRef.current as any).captureStream(30);
      trackToSend = canvasStream.getVideoTracks()[0];
      
      if (rawVideoRef.current && rawVideoRef.current.srcObject !== localStreamRef.current) {
        rawVideoRef.current.srcObject = localStreamRef.current;
      }
    } else {
      trackToSend = localStreamRef.current.getVideoTracks()[0];
    }

    if (localVideoRef.current) {
      const displayStream = new MediaStream([trackToSend]);
      localVideoRef.current.srcObject = displayStream;
    }

    if (!isScreenSharing) {
      peersRef.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && trackToSend) sender.replaceTrack(trackToSend);
      });
    }

  }, [activeEffect, isScreenSharing]);

  const sendChatMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !socket || !currentUser || isChatLocked) return;

    const payload = {
      channelId,
      senderId: currentUser.sub,
      senderName: currentUser.name,
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('in_call_message', payload);
    setChatMessages(prev => [...prev, payload]);
    setChatInput("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && socket && currentUser && !isChatLocked) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const payload = {
          channelId,
          senderId: currentUser.sub,
          senderName: currentUser.name,
          file: {
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
            type: file.type,
            data: event.target?.result
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        socket.emit('in_call_file', payload);
        setChatMessages(prev => [...prev, payload]);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAdminChatLock = () => {
    if (!isAdmin || !socket) return;
    const newState = !isChatLocked;
    socket.emit('toggle_in_call_chat', {
      channelId,
      isEnabled: !newState,
      adminId: currentUser.sub
    });
    setIsChatLocked(newState);
  };

  const inviteUser = (userId: string) => {
    if (socket && currentUser) {
      socket.emit('invite_video_call', {
        channelId,
        senderId: currentUser.sub,
        targetId: userId,
        senderName: currentUser.name
      });
    }
  };

  if (permissionError) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900/95 flex items-center justify-center backdrop-blur-sm">
        <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-3xl text-white p-8 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6">
             <VideoOff size={40} />
          </div>
          <h3 className="text-xl font-bold mb-3">Permission Denied</h3>
          <p className="text-sm text-gray-400 mb-8">
            {permissionError}
          </p>
          <button onClick={onClose} className="px-8 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors">
            Return to Chat
          </button>
        </div>
      </div>
    );
  }

  // Calculate grid columns based on number of participants (including local)
  const totalParticipants = remoteStreams.size + 1;
  const gridCols = totalParticipants === 1 ? 'grid-cols-1' :
                   totalParticipants === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                   totalParticipants <= 4 ? 'grid-cols-2' :
                   totalParticipants <= 9 ? 'grid-cols-3' : 'grid-cols-4';

  const containerClasses = isExpanded 
    ? "fixed inset-0 z-50 bg-[#202124] flex flex-col"
    : "absolute bottom-6 right-6 w-[340px] h-[220px] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden z-40 border border-gray-800 flex flex-col transition-all duration-300";

  return (
    <div className={containerClasses}>
      {/* Main Content Area */}
      <div className={`flex-1 flex overflow-hidden ${isExpanded ? 'p-4 pb-0 gap-4' : ''}`}>
        
        {/* Video Area */}
        <div className={`flex-1 relative bg-[#3C4043] rounded-xl overflow-hidden flex flex-col ${isExpanded && activeTab !== 'video' ? 'hidden md:flex' : 'flex'}`}>
           
          {isScreenSharing ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
               <MonitorPlay size={64} className="text-gray-400 mb-6" />
               <h2 className="text-2xl font-medium text-white mb-2">You are presenting</h2>
               <p className="text-gray-400 max-w-md text-sm mb-6">
                 To avoid an infinity mirror, don't share your entire screen or browser window. Share just a tab or a different window instead.
               </p>
               <div className="flex gap-4">
                 <button className="px-6 py-2.5 rounded-full border border-gray-600 text-white font-medium hover:bg-gray-800 transition-colors">
                   Show my screen anyway
                 </button>
                 <button onClick={toggleScreenShare} className="px-6 py-2.5 rounded-full border border-gray-600 text-white font-medium hover:bg-gray-800 transition-colors">
                   Stop presenting
                 </button>
               </div>
               
               {/* Picture in Picture overlay when screen sharing */}
               <div className="absolute bottom-4 right-4 flex gap-4">
                 {/* Local small video */}
                 <div className="w-64 aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl relative">
                   <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'} ${isScreenSharing ? '' : 'scale-x-[-1]'}`} />
                   {isVideoOff && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
                       <Avatar person={currentUser?.name} name={currentUser?.name} size={48} />
                     </div>
                   )}
                   <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-white text-[10px]">You</div>
                 </div>
                 
                 {/* Remote streams (just the first few or a generic one) */}
                 {Array.from(remoteStreams.entries()).slice(0, 2).map(([id, stream]) => (
                   <div key={id} className="w-64 aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl relative">
                     <RemoteVideo id={id} stream={stream} members={channelMembers} isPip />
                   </div>
                 ))}
               </div>
            </div>
          ) : (
            <div className={`flex-1 p-2 md:p-4 grid gap-2 md:gap-4 ${gridCols} content-center overflow-y-auto`}>
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-lg aspect-video flex items-center justify-center min-h-[150px]">
            {/* Hidden raw video and canvas for blur processing */}
            <video ref={rawVideoRef} autoPlay playsInline muted className="hidden" />
            <canvas ref={processedCanvasRef} className="hidden" />

            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'} ${isScreenSharing ? '' : 'scale-x-[-1]'}`}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
                <Avatar person={currentUser?.name} name={currentUser?.name} size={64} />
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-2">
              You (Local) {isMuted && <MicOff size={12} className="text-red-400" />}
            </div>
          </div>

          {/* Remote Videos */}
          {Array.from(remoteStreams.entries()).map(([id, stream]) => (
            <RemoteVideo key={id} id={id} stream={stream} members={channelMembers} />
          ))}
        </div>

          )}
        </div>

      {/* Right Sidebar (Participants / Invites) */}
      {isExpanded && activeTab === 'participants' && (
        <div className="w-full md:w-[360px] bg-white rounded-xl overflow-hidden flex flex-col z-30 shadow-lg absolute inset-0 md:relative">
          <div className="p-4 border-b border-gray-200/80 flex items-center justify-between bg-white">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              Participants
            </h3>
            <button onClick={() => setActiveTab('video')} className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Maximize2 size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">In Call ({remoteStreams.size + 1})</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar person={currentUser?.name} name={currentUser?.name} size={32} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{currentUser?.name} <span className="text-gray-400 font-normal">(You)</span></p>
                  </div>
                </div>
                {Array.from(remoteStreams.keys()).map(id => {
                  const member = channelMembers?.find(m => m.id === id || m.name === id) || { name: 'Remote User ' + id };
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <Avatar person={member.name} name={member.name} size={32} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{member.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {isAdmin && channelMembers && channelMembers.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-6">Invite to Call</h4>
                <div className="space-y-3">
                  {channelMembers.filter(m => m.id !== currentUser?.sub && !remoteStreams.has(m.id)).map((member, index) => (
                    <div key={member.id || `member-invite-${index}`} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <Avatar person={member.name} name={member.name} size={32} />
                        <p className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{member.name}</p>
                      </div>
                      <button 
                        onClick={() => inviteUser(member.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors text-xs font-bold border border-indigo-100 hover:border-indigo-600 shadow-sm"
                      >
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!isAdmin && (
               <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mt-8">
                  <p className="text-xs text-gray-500 font-medium leading-relaxed text-center">
                    Only admins can invite members to the active call.
                  </p>
               </div>
            )}
          </div>
        </div>
      )}

      {/* In-Call Chat Sidebar */}
      {isExpanded && activeTab === 'chat' && (
        <div className="w-full md:w-[360px] bg-white rounded-xl overflow-hidden flex flex-col z-30 shadow-lg absolute inset-0 md:relative">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-600" />
              In-Call Chat
            </h3>
            <div className="flex gap-2 items-center">
              {isAdmin && (
                <button 
                  onClick={toggleAdminChatLock}
                  className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${
                    isChatLocked ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                  title={isChatLocked ? "Unlock Chat" : "Lock Chat for Non-Admins"}
                >
                  {isChatLocked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
              )}
              <button onClick={() => setActiveTab('video')} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-50">
                <MessageSquare size={32} className="mb-2" />
                <p className="text-sm font-medium">No messages yet.</p>
                <p className="text-xs mt-1">Chat history is lost when the call ends.</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.senderId === currentUser.sub ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold text-gray-400 mb-0.5 mx-1">{msg.senderName} • {msg.timestamp}</span>
                  {msg.file ? (
                    <div className={`p-2.5 rounded-xl border max-w-[85%] flex items-center gap-3 ${msg.senderId === currentUser.sub ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white border-gray-200 text-gray-800'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.senderId === currentUser.sub ? 'bg-indigo-500' : 'bg-gray-100 text-gray-500'}`}>
                        <Paperclip size={16} />
                      </div>
                      <div className="min-w-0 overflow-hidden">
                        <p className="text-xs font-bold truncate">{msg.file.name}</p>
                        <p className={`text-[10px] ${msg.senderId === currentUser.sub ? 'text-indigo-200' : 'text-gray-400'}`}>{msg.file.size}</p>
                      </div>
                      <a href={msg.file.data} download={msg.file.name} className="p-1.5 hover:bg-black/10 rounded-md shrink-0 ml-1">
                        <Download size={14} />
                      </a>
                    </div>
                  ) : (
                    <div className={`px-3 py-2 rounded-xl text-[13px] max-w-[85%] shadow-sm ${
                      msg.senderId === currentUser.sub ? 'bg-[#5E43FF] text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-200">
            {isChatLocked && !isAdmin ? (
              <div className="w-full text-center p-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-100 flex items-center justify-center gap-2">
                <Lock size={14} /> Chat has been locked by an admin.
              </div>
            ) : (
              <form onSubmit={sendChatMessage} className="flex items-center gap-2">
                <label className="cursor-pointer p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Paperclip size={18} />
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 bg-[#5E43FF] text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Effects Sidebar */}
      {isExpanded && activeTab === 'effects' && (
        <div className="w-full md:w-[360px] bg-white rounded-xl overflow-hidden flex flex-col z-30 shadow-lg absolute inset-0 md:relative">
          <div className="p-4 border-b border-gray-200/80 flex items-center justify-between bg-white">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" />
              Backgrounds and effects
            </h3>
            <button onClick={() => setActiveTab('video')} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Maximize2 size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Background</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveEffect('none')}
                  className={`relative aspect-video rounded-xl border-2 overflow-hidden bg-gray-100 flex flex-col items-center justify-center transition-all ${
                    activeEffect === 'none' ? 'border-indigo-600 shadow-md ring-2 ring-indigo-200 ring-offset-1' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <VideoOff size={24} className="text-gray-400 mb-1" />
                  <span className="text-[10px] font-bold text-gray-500">None</span>
                </button>
                <button
                  onClick={() => setActiveEffect('blur')}
                  className={`relative aspect-video rounded-xl border-2 overflow-hidden bg-indigo-50 flex flex-col items-center justify-center transition-all ${
                    activeEffect === 'blur' ? 'border-indigo-600 shadow-md ring-2 ring-indigo-200 ring-offset-1' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="absolute inset-0 bg-indigo-200/30 backdrop-blur-md"></div>
                  <Users size={24} className="text-indigo-600 mb-1 z-10" />
                  <span className="text-[10px] font-bold text-indigo-700 z-10">Blur</span>
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mt-8">
               <p className="text-xs text-indigo-800 font-medium leading-relaxed flex items-start gap-2">
                 <Sparkles size={16} className="shrink-0 mt-0.5" />
                 Applying effects may impact performance. If your video stutters, try selecting "None".
               </p>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Full-width Bottom Control Bar */}
      {isExpanded && (
        <div className="h-[88px] flex items-center justify-between px-6 bg-[#202124] shrink-0">
          
          {/* Left: Time and Name */}
          <div className="flex items-center text-white/90 font-medium text-base truncate w-1/4">
            {currentTime} <span className="mx-2 px-2 text-white/30">|</span> {channelId}
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-3 justify-center flex-1">
            <button 
              onClick={toggleMute}
              className={`p-3 rounded-full transition-all shadow-sm ${
                isMuted ? 'bg-[#EA4335] text-white hover:bg-[#EA4335]/90' : 'bg-[#3C4043] text-white hover:bg-[#4a4e51]'
              }`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button 
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-all shadow-sm ${
                isVideoOff ? 'bg-[#EA4335] text-white hover:bg-[#EA4335]/90' : 'bg-[#3C4043] text-white hover:bg-[#4a4e51]'
              }`}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <button className="p-3 rounded-full bg-[#3C4043] text-white hover:bg-[#4a4e51] transition-all hidden sm:block">
              <ClosedCaption size={20} />
            </button>

            <button className="p-3 rounded-full bg-[#3C4043] text-white hover:bg-[#4a4e51] transition-all hidden md:block">
              <Smile size={20} />
            </button>
            
            <button 
              onClick={toggleScreenShare}
              className={`p-3 rounded-full transition-all shadow-sm hidden sm:block ${
                isScreenSharing ? 'bg-[#A8C7FA] text-[#0B57D0]' : 'bg-[#3C4043] text-white hover:bg-[#4a4e51]'
              }`}
            >
              <MonitorUp size={20} />
            </button>

            <button className="p-3 rounded-full bg-[#3C4043] text-white hover:bg-[#4a4e51] transition-all hidden lg:block">
              <Hand size={20} />
            </button>

            <button className="p-3 rounded-full bg-[#3C4043] text-white hover:bg-[#4a4e51] transition-all">
              <MoreVertical size={20} />
            </button>

            <button 
              onClick={onClose}
              className="px-5 py-3 ml-2 rounded-full bg-[#EA4335] text-white hover:bg-[#EA4335]/90 transition-all shadow-sm flex items-center"
            >
              <PhoneOff size={20} />
            </button>
          </div>

          {/* Right: Info, Chat, etc */}
          <div className="flex items-center gap-2 justify-end w-1/4">
            <button className="p-2.5 rounded-full text-white/80 hover:bg-[#3C4043] transition-colors hidden xl:block">
              <Info size={20} />
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'participants' ? 'video' : 'participants')}
              className={`p-2.5 rounded-full transition-colors ${activeTab === 'participants' ? 'bg-[#A8C7FA] text-[#0B57D0]' : 'text-white/80 hover:bg-[#3C4043]'}`}
            >
              <Users size={20} />
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'chat' ? 'video' : 'chat')}
              className={`p-2.5 rounded-full transition-colors ${activeTab === 'chat' ? 'bg-[#A8C7FA] text-[#0B57D0]' : 'text-white/80 hover:bg-[#3C4043]'}`}
            >
              <MessageSquare size={20} />
            </button>
            <button 
              className="p-2.5 rounded-full text-white/80 hover:bg-[#3C4043] transition-colors hidden md:block"
            >
              <Shapes size={20} />
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'effects' ? 'video' : 'effects')}
              className={`p-2.5 rounded-full transition-colors hidden lg:block ${activeTab === 'effects' ? 'bg-[#A8C7FA] text-[#0B57D0]' : 'text-white/80 hover:bg-[#3C4043]'}`}
            >
              <ShieldAlert size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component to manage remote video element
function RemoteVideo({ id, stream, members, isPip = false }: { id: string, stream: MediaStream, members: any[], isPip?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const member = members?.find(m => m.id === id || m.name === id) || { name: 'Participant' };

  if (isPip) {
    return (
      <>
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-white text-[10px]">{member.name}</div>
      </>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg aspect-video flex items-center justify-center min-h-[150px]">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-medium">
        {member.name}
      </div>
    </div>
  );
}
