import { Route, BrowserRouter, Routes, Router } from 'react-router-dom'
import Sender from "./pages/sender"
import Receiver from './pages/receiver'

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <div>
            Home Page
          </div>
        } />
        <Route path='/sender' element={<Sender />} />
        <Route path='/receiver' element={<Receiver />} />
      </Routes>
    </BrowserRouter>
  )
}