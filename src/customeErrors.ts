export class Error404 extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Error404";
    }
}

export class Error400 extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Error400";
    }
}

