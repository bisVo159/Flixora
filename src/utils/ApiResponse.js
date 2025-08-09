class ApiResponse {
    constructor(statusCode,data=null,message="Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = this.statusCode >= 200 && this.statusCode < 400;
    }
}

export { ApiResponse };