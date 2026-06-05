import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../api/auth';

export const bootstrap = createAsyncThunk('auth/bootstrap', async () => {
  const res = await authApi.getMe();
  return res.data.data ?? res.data;
});

export const login = createAsyncThunk('auth/login', async ({ email, password }) => {
  const res = await authApi.login({ email, password });
  const token = res.data.token;
  localStorage.setItem('token', token);
  const me = await authApi.getMe();
  return me.data.data ?? me.data;
});

export const register = createAsyncThunk('auth/register', async (data) => {
  const res = await authApi.register(data);
  const token = res.data.token;
  localStorage.setItem('token', token);
  const me = await authApi.getMe();
  return me.data.data ?? me.data;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await authApi.logout(); } catch { /* ignore */ }
  localStorage.removeItem('token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: !!localStorage.getItem('token'),
  },
  reducers: {},
  extraReducers: (builder) => {
    // bootstrap
    builder.addCase(bootstrap.fulfilled, (state, action) => {
      state.user = action.payload;
      state.loading = false;
    });
    builder.addCase(bootstrap.rejected, (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      localStorage.removeItem('token');
    });

    // login
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload;
      state.token = localStorage.getItem('token');
    });

    // register
    builder.addCase(register.fulfilled, (state, action) => {
      state.user = action.payload;
      state.token = localStorage.getItem('token');
    });

    // logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
    });
  },
});

export default authSlice.reducer;

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectIsAuthenticated = (state) => !!state.auth.user;
