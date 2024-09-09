// @ts-nocheck

import { useRouteError } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  console.error(error)

  return (
    <div className="flex absolute inset-0 justify-center items-center">
      <div>
        <h1 className="text-5xl text-center">404 NOT FOUND.</h1>
        <p>
          <i>{error.statusText || error.message}</i>
        </p>
      </div>
    </div>
  )
}
