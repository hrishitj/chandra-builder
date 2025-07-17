export class Codelist {
    public id: number;
    public name: string;
    public isActive: boolean;

    constructor(id: number, name: string, isActive: boolean) {
        this.id = id;
        this.name = name;
        this.isActive = isActive;
    }
}