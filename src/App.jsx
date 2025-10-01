import Header from './components/Header'
import Hero from './components/Hero'
import Simulator from './components/Simulator'
import Services from './components/Services'
import Plans from './components/Plans'

export default function App(){
  return (
    <div className="container">
      <Header />
      <div className="row" style={{marginTop:24}}>
        <div style={{flex:'1 1 360px', minWidth:300}}>
          <Hero />
        </div>
        <Simulator />
      </div>
      <Services />
      <Plans />
      <footer>© KASH Solutions</footer>
    </div>
  )
}
