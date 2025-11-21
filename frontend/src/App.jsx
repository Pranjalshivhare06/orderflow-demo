import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CustomerOrder from './components/CustomerOrder'
import ReceptionDashboard from './components/ReceptionDashboard'
import TableManagement from './components/TableManagement'
import MenuManagement from './components/MenuManagement'
import './App.css'
import InventoryManagement from './components/InventoryManagement'
import Analysis from './components/Analysis'
import BillingManagement from './components/BillingManagement'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/order/:tableNumber" element={<CustomerOrder />} />
          <Route path="/reception" element={<ReceptionDashboard />} />
          <Route path="/admin/tables" element={<TableManagement />} />
          <Route path="/" element={<Navigate to="/reception" replace />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          {/* <Route path="/admin/bill-printing" element={<BillPrinting/>} /> */}
          <Route path='/analysis' element={<Analysis/>}/>
          <Route path='/billing' element={<BillingManagement/>} />
        </Routes>
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  )
}

export default App