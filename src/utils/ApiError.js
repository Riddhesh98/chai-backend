class ApiError extends Error {

        constructor(
            message="something went wrong",
            StatusCode,
            errors=[],
            statck=""
        ){
            super(message);
            this.StatusCode = StatusCode;
            this.message = message;
            this.errors = errors;
            this.success = false;
            this.data=null;

            if(statck){
                this.stack = statck;
        }
        else{
            Error.captureStackTrace(this,this.constructor); 
        }
    }
}

export {ApiError};