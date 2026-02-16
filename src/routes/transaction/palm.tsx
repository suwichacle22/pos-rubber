import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/transaction/palm')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/transaction/palm"!</div>
}
