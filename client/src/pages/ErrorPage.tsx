import { isRouteErrorResponse, useRouteError } from "react-router-dom"

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`
  } else if (error instanceof Error) {
    return error.message
  } else if (typeof error === 'string') {
    return error
  } else {
    console.error(error)
    return 'Unknown error'
  }
}

const ErrorPage = () => {
  const error = useRouteError()
  console.error(error)

  let errorMessage = getErrorMessage(error)

  return (
    <div>
      <h1>Oops!</h1>
      <p>sorry, an unexpected error has occured</p>
      <p>
        <i>{errorMessage}</i>
      </p>
    </div>
  )
}

export { ErrorPage }