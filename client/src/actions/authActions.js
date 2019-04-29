import axios from 'axios'
import jwt_decode from 'jwt-decode'

import setAuthToken from '../utils/setAuthToken'
import { GET_ERRORS, SET_CURRENT_USER } from './types'

// Register a user
export const registerUser = (userData, history) => dispatch => {
    axios.post('/api/users/register', userData)
        .then(res => history.push('./login'))
        .catch(err => 
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        )
}

// Login User - Get user Token
export const loginUser = userData => dispatch => {
    axios.post('/api/users/login', userData)
        .then(res => {
            // Save to localStorage, set to auth header
            const { token } = res.data
            localStorage.setItem('jwtToken', token)
            setAuthToken(token)
            
            // Decode token to get user data
            const decodedUserData = jwt_decode(token)
            dispatch(setCurrentUser(decodedUserData))
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
}

// Set logged in user
export const setCurrentUser = decodedUserData => {
    return {
        type: SET_CURRENT_USER,
        payload: decodedUserData
    }
}