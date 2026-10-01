import sys

def resolve_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    out = []
    state = "normal"  # normal, ours, theirs

    for line in lines:
        if line.startswith("<<<<<<< "):
            state = "ours"
        elif line.startswith("======="):
            state = "theirs"
        elif line.startswith(">>>>>>> "):
            state = "normal"
        else:
            if state == "normal" or state == "ours":
                out.append(line)

    with open(filepath, 'w') as f:
        f.writelines(out)

resolve_file("frontend/components/projects/ProjectHeader.tsx")
resolve_file("frontend/components/projects/ProjectReports.tsx")
print("Done")
