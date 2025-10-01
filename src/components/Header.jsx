export default function Header(){
  return (
    <div className="hstack">
      <img src="/kash-logo.svg" alt="KASH" width="36" height="36" style={{borderRadius:12}} />
      <div>
        <div style={{fontWeight:700}}>KASH Solutions</div>
        <div className="badge">KASH CORPORATE SOLUTIONS LLC · Florida LLC</div>
      </div>
    </div>
  )
}
