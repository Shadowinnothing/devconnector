import { TEST_DISPATCH } from './types'

// Register a user
export const registerUser = userData => {
    return {
        type: TEST_DISPATCH,
        payload: userData
    }
}