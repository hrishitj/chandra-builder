export class CostingResponse {
    price!: {
        necklacePrice: number,
        braceletPrice: number
    };
    paths!: string[];
    chainImages!: string[];
    braceletImages!: string[];
    length!: number;
    width!: number;
    height!: number;
    deliveryTime!: string;
    noOfDiamonds!: number;
    caratWeight!: number;

    constructor(
        price: { necklacePrice: number, braceletPrice: number },
        paths: string[],
        chainImages: string[],
        braceletImages: string[],
        length: number,
        width: number,
        height: number,
        deliveryTime: string,
        noOfDiamonds: number,
        caratWeight: number
    ) {
        this.price = price;
        this.paths = paths;
        this.chainImages = chainImages;
        this.braceletImages = braceletImages;
        this.length = length;
        this.width = width;
        this.height = height;
        this.deliveryTime = deliveryTime;
        this.noOfDiamonds = noOfDiamonds;
        this.caratWeight = caratWeight;
    }
}