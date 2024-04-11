export default class Response {
  success(data: any, message: string) {
    return {
      status: 200,
      result: {
        data: data,
        message: message,
        error: [],
      },
    };
  }

  created(data: any, message: string) {
    return {
      status: 201,
      result: {
        data: data,
        message: message,
        error: [],
      },
    };
  }

  unauthorized(message: string) {
    return {
      status: 401,
      result: {
        data: {},
        message: message,
        error: [],
      },
    };
  }

  forbidden(message: string) {
    return {
      status: 403,
      result: {
        data: {},
        message: message,
        error: [],
      },
    };
  }

  notFound(message: string) {
    return {
      status: 404,
      result: {
        data: {},
        message: message,
        error: [],
      },
    };
  }

  conflict(message: string) {
    return {
      status: 409,
      result: {
        data: {},
        message: message,
        error: [],
      },
    };
  }

  internalError(error: any) {
    return {
      status: 500,
      result: {
        data: {},
        message: "Internal server error.",
        error: [error.message],
      },
    };
  }
}
