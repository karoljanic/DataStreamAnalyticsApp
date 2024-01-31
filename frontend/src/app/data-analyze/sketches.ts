export interface Stream {
    id: number;
    name: string;
}

export interface StreamDetail {
    id: number;
    name: string;
    tags: Tag[];
    types: Type[];
}

export interface Tag {
    id: number;
    name: string;
    category: string;
}

export interface Type {
    id: number;
    name: string;
    unit: string;
}

export interface ChartPoint {
    day: string;
    value: number;
}

export interface Query {
    id: number;
    tree_form: any;
    title: string,
    description: string,
}
