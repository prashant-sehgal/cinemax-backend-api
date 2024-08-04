export default class WebError extends Error {
  status: string = '' // fail or error

  constructor(public statusCode: number, message: string) {
    super(message)
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error'
  }
}
