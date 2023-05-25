interface Stat {
  name: string;
  value: string;
}

interface Event {
  name: string;
  start: Date | string;
  end: Date | string;
}

export interface GP {
  name: string;
  url: string;
  stats: Stat[];
  events: Event[];
  image?: string;
}
