declare module "framer" {
    export const addPropertyControls: (component: any, controls: Record<string, any>) => void;
    export const ControlType: {
        Boolean: string;
        Color: string;
        Number: string;
        String: string;
        Enum: string;
        Array: string;
    };
}
