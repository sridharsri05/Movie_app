import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/api";
import { jwtDecode } from "jwt-decode";

export const login = createAsyncThunk("auth/login", async (userData, thunkAPI) => {
  try {
    // Make a request to the login API endpoint
    const response = await axios.post("/login", userData);

    // Decode the token to extract user and role information
    const { userId } = jwtDecode(response.data.token);
    console.log(userId, "jwt data");
    localStorage.setItem("authToken", response.data.token);
    // Update the state directly without dispatching another action
    thunkAPI.dispatch(
      loginFulfilled({
        user: userId,
      })
    );
    console.log(response.data);
    // Assuming the backend returns user data upon successful login
    return response.data;
  } catch (error) {
    // Log the actual error response
    console.error(
      "Login failed:",
      error.response ? error.response.data.message : error.message
    );

    // Handle errors and reject with value
    return thunkAPI.rejectWithValue({
      error: error.response ? error.response.data : error.message,
    });
  }
});

export const signUp = createAsyncThunk("auth/signUp", async (userData, thunkAPI) => {
  try {
    const response = await axios.post("/signup", userData);
    console.log(response.data);
    return response.data; // Assuming the backend returns user data upon successful registration
  } catch (error) {
    return thunkAPI.rejectWithValue({
      error: error.response ? error.response.data : error.message,
    });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
    role: null,
    error: null,
  },
  reducers: {
    loginFulfilled: (state, action) => {
      const { user } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.role = user.role;
      state.error = null;
    },
    logout: (state) => {
      localStorage.removeItem("authToken");
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signUp.fulfilled, (state, action) => {
      // Handle successful registration
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.error = null;
    });
    builder.addCase(signUp.rejected, (state, action) => {
      // Handle registration failure
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.error = action.payload.error;
    });

    builder.addCase(login.rejected, (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.error = action.payload.error;
    });
  },
});

export const { logout, loginFulfilled } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
