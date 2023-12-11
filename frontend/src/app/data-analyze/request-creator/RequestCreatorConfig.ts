export interface RequestCreatorConfig {
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    quaternaryColor: string;
    quinaryColor: string;
    textColor: string;
    textSize: number;
    internalPadding: number;
}

export const RequestCreatorConfig: Record<string, RequestCreatorConfig> = {
    'subdued-light-theme': {
        primaryColor: '#575a5c',
        secondaryColor: '#435768',
        tertiaryColor: '#e7e8e8',
        quaternaryColor: '#c4c5c5',
        quinaryColor: '#b9b8aa',
        textColor: '#ffffff',
        textSize: 16,
        internalPadding: 8
    },
    'subdued-dark-theme': {
        primaryColor: '#575a5c',
        secondaryColor: '#435768',
        tertiaryColor: '#e7e8e8',
        quaternaryColor: '#c4c5c5',
        quinaryColor: '#b9b8aa',
        textColor: '#ffffff',
        textSize: 16,
        internalPadding: 8
    },
    'colorful-light-theme': {
        primaryColor: '#772e25',
        secondaryColor: '#c44536',
        tertiaryColor: '#efe6e5',
        quaternaryColor: '#d6c0be',
        quinaryColor: '#283d3b',
        textColor: '#ffffff',
        textSize: 16,
        internalPadding: 8
    },
    'colorful-dark-theme': {
        primaryColor: '#772e25',
        secondaryColor: '#c44536',
        tertiaryColor: '#efe6e5',
        quaternaryColor: '#d6c0be',
        quinaryColor: '#283d3b',
        textColor: '#ffffff',
        textSize: 16,
        internalPadding: 8
    }
};