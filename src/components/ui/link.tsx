
// @ts-ignore
export default function Link({ href, children, ...props }) {
  return <a
    href={
      href.startsWith("/") ? href : `/${href}`
    }
    {...props}
  >
    {children}
  </a>
}