export type ProjectCard = {
  id: string;
  title: string;
  tag?: { label: string; bg: string; text: string };
  assignee: { name: string; person: string };
  date: string;
  commentsCount?: number;
  completed?: boolean;
};

export type ProjectColumn = {
  id: string;
  title: string;
  count: number;
  dotClass: string;
  cards: ProjectCard[];
};

export const initialProjectColumns: ProjectColumn[] = [];
