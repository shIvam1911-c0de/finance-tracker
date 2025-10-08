import { lazy } from 'react';

export const Dashboard = lazy(() => import('./Dashboard'));
export const Transactions = lazy(() => import('./Transactions'));
export const Analytics = lazy(() => import('./Analytics'));
export const Profile = lazy(() => import('./Profile'));