import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom'

import Footer from './components/layout/Footer'
import Landing from './components/layout/Landing'
import Navbar from './components/layout/Navbar'
import Login from './components/auth/Login'
import Register from './components/auth/Register'

import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Navbar />
            <Route exact path='/' component={Landing} />
            <div className="container">
              <Route path='/login' component={Login} /> 
              <Route path='/Register' component={Register} />
            </div>
          <Footer />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
