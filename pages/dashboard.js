import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TrendingUp, DollarSign, Activity, LogOut } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const uid = localStorage.getItem('uid');
    const uname = localStorage.getItem('uname');
    const accessToken = localStorage.getItem('accessToken');

    if (!uid || !accessToken) {
      router.push('/');
      return;
    }

    setUser({ uid, uname, accessToken });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('uid');
    localStorage.removeItem('uname');
    localStorage.removeItem('accessToken');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-darker p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold glow-text">TradeTracker Pro</h1>
            <p className="text-muted-foreground">Welcome back, {user.uname}!</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut size={20} />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Start by adding your first trade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">
                Your trading performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">
                Track your success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:bg-card/80 transition-colors" onClick={() => router.push('/trades')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-neon-blue" />
                Trading Journal
              </CardTitle>
              <CardDescription>
                View and manage your trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Open Journal</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-card/80 transition-colors" onClick={() => router.push('/research')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-neon-purple" />
                Stock Research
              </CardTitle>
              <CardDescription>
                Research stocks with real-time data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Research</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-card/80 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-neon-green" />
                Portfolio
              </CardTitle>
              <CardDescription>
                View your portfolio performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center glow-text">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-effect p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-2">Trade Journal</h3>
              <p className="text-sm text-muted-foreground">Log and track all your trades</p>
            </div>
            <div className="glass-effect p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-2">Portfolio Analytics</h3>
              <p className="text-sm text-muted-foreground">Detailed performance metrics</p>
            </div>
            <div className="glass-effect p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-2">AI Stock Analysis</h3>
              <p className="text-sm text-muted-foreground">Get AI insights on stocks</p>
            </div>
            <div className="glass-effect p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-2">Real-time Data</h3>
              <p className="text-sm text-muted-foreground">Live market information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 