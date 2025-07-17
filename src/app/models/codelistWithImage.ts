import { Codelist } from "./codelist";

export class CodelistWIthIcon extends Codelist {
    public icon: string;
    
    constructor(id: number, name: string, isActive: boolean, icon: string) {
        super(id, name, isActive);
        this.icon = icon;
    }
}