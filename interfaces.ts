interface Stat {
  name: string;
  value: string;
}

interface Event {
  name: string;
  start: number;
  end: number;
}

export interface GP {
  name: string;
  url: string;
  stats: Stat[];
  events: Event[];
  image?: string;
}
