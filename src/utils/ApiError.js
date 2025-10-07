class ApiError extends Error {

        constructor(
            message="something went wrong",
            StatusCode,
            errors=[],
            stack=""
        ){
            super(message);
            this.StatusCode = StatusCode;
            this.message = message;
            this.errors = errors;
            this.success = false;
            this.data=null;

            if(stack){
                this.stack = stack;
        }
        else{
            Error.captureStackTrace(this,this.constructor); 
        }
    }
}

export {ApiError};