export interface Stream {
    id: number;
    name: string;
}

export interface Tag {
    id: number;
    name: string;
    category: string;
}

export interface Type {
    id: number;
    name: string;
    description: string;
}

export interface ChartPoint {
    data: string;
    value: number;
}
