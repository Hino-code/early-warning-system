import { useState } from 'react';
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Activity, 
  Server, 
  Wifi, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  HardDrive, 
  Thermometer,
  Zap,
  Cloud,
  RefreshCw,
  Shield,
  Eye
} from 'lucide-react';

// Mock system status data
const systemMetrics = [
  { time: '00:00', cpu: 45, memory: 62, network: 89, storage: 34 },
  { time: '04:00', cpu: 52, memory: 68, network: 91, storage: 34 },
  { time: '08:00', cpu: 78, memory: 72, network: 87, storage: 35 },
  { time: '12:00', cpu: 65, memory: 71, network: 92, storage: 35 },
  { time: '16:00', cpu: 59, memory: 69, network: 88, storage: 36 },
  { time: '20:00', cpu: 48, memory: 65, network: 90, storage: 36 },
];

const sensorData = [
  { id: 'TEMP001', name: 'Temperature Sensor A1', status: 'Online', lastReading: '28.5°C', lastUpdate: '2 min ago', battery: 87 },
  { id: 'TEMP002', name: 'Temperature Sensor A2', status: 'Online', lastReading: '29.1°C', lastUpdate: '2 min ago', battery: 92 },
  { id: 'HUM001', name: 'Humidity Sensor B1', status: 'Online', lastReading: '75%', lastUpdate: '1 min ago', battery: 78 },
  { id: 'HUM002', name: 'Humidity Sensor B2', status: 'Warning', lastReading: '68%', lastUpdate: '15 min ago', battery: 23 },
  { id: 'PEST001', name: 'Pest Detection Cam C1', status: 'Online', lastReading: '12 detections', lastUpdate: '5 min ago', battery: null },
  { id: 'PEST002', name: 'Pest Detection Cam C2', status: 'Offline', lastReading: 'No data', lastUpdate: '2 hours ago', battery: null },
  { id: 'SOIL001', name: 'Soil Moisture Sensor D1', status: 'Online', lastReading: '68%', lastUpdate: '3 min ago', battery: 65 },
  { id: 'SOIL002', name: 'Soil Moisture Sensor D2', status: 'Online', lastReading: '72%', lastUpdate: '2 min ago', battery: 89 },
];

const systemLogs = [
  { time: '2024-06-22 14:30:22', level: 'INFO', message: 'Hourly data sync completed successfully', component: 'Data Sync' },
  { time: '2024-06-22 14:25:15', level: 'WARNING', message: 'Humidity Sensor B2 battery low (23%)', component: 'Sensor Monitor' },
  { time: '2024-06-22 14:15:08', level: 'ERROR', message: 'Pest Detection Cam C2 connection timeout', component: 'Camera System' },
  { time: '2024-06-22 14:00:45', level: 'INFO', message: 'SARIMA forecast model updated', component: 'AI Engine' },
  { time: '2024-06-22 13:45:33', level: 'INFO', message: 'Field B-2 pest alert generated', component: 'Alert System' },
  { time: '2024-06-22 13:30:18', level: 'WARNING', message: 'High network latency detected (>200ms)', component: 'Network' },
  { time: '2024-06-22 13:15:22', level: 'INFO', message: 'Database backup completed', component: 'Database' },
  { time: '2024-06-22 13:00:11', level: 'INFO', message: 'System health check passed', component: 'System Monitor' },
];

const networkNodes = [
  { name: 'Main Server', status: 'Online', latency: '12ms', uptime: '99.8%', load: 45 },
  { name: 'Field Gateway A', status: 'Online', latency: '45ms', uptime: '99.2%', load: 62 },
  { name: 'Field Gateway B', status: 'Online', latency: '38ms', uptime: '98.9%', load: 58 },
  { name: 'Field Gateway C', status: 'Warning', latency: '156ms', uptime: '97.1%', load: 78 },
  { name: 'Cloud Sync', status: 'Online', latency: '89ms', uptime: '99.9%', load: 23 },
  { name: 'AI Processing', status: 'Online', latency: '34ms', uptime: '99.5%', load: 67 },
];

export function SystemStatus() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'offline': case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'offline': case 'error': return <Badge variant="destructive">Offline</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getLogLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info': return <Badge className="bg-blue-100 text-blue-800">INFO</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      case 'error': return <Badge variant="destructive">ERROR</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  const onlineSensors = sensorData.filter(s => s.status === 'Online').length;
  const totalSensors = sensorData.length;
  const systemHealth = Math.round((onlineSensors / totalSensors) * 100);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Pest.i System Status</h1>
          <p className="text-muted-foreground">Real-time monitoring of system health and performance</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-5 w-5 text-green-500" />
            <h3>System Health</h3>
          </div>
          <div className="text-2xl font-bold text-green-600">{systemHealth}%</div>
          <p className="text-sm text-muted-foreground">{onlineSensors}/{totalSensors} sensors online</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Server className="h-5 w-5 text-blue-500" />
            <h3>Server Uptime</h3>
          </div>
          <div className="text-2xl font-bold">99.8%</div>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-5 w-5 text-purple-500" />
            <h3>Data Points</h3>
          </div>
          <div className="text-2xl font-bold">2.4M</div>
          <p className="text-sm text-muted-foreground">Collected today</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h3>Active Alerts</h3>
          </div>
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <p className="text-sm text-muted-foreground">Require attention</p>
        </Card>
      </div>

      {/* System Status Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="sensors">Sensor Status</TabsTrigger>
          <TabsTrigger value="network">Network Health</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-4">System Components Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-blue-500" />
                    <span>Main Server</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-purple-500" />
                    <span>Database</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>AI Processing Engine</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-4 w-4 text-blue-500" />
                    <span>Cloud Sync</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Security System</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Resource Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">CPU Usage</span>
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Memory Usage</span>
                    </div>
                    <span className="text-sm font-medium">71%</span>
                  </div>
                  <Progress value={71} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Storage Usage</span>
                    </div>
                    <span className="text-sm font-medium">36%</span>
                  </div>
                  <Progress value={36} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Network Usage</span>
                    </div>
                    <span className="text-sm font-medium">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-4">24-Hour System Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={systemMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} name="Memory %" />
                <Line type="monotone" dataKey="network" stroke="#f59e0b" strokeWidth={2} name="Network %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Sensor Network Status</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sensor ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Reading</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sensorData.map((sensor) => (
                  <TableRow key={sensor.id}>
                    <TableCell className="font-mono text-sm">{sensor.id}</TableCell>
                    <TableCell className="font-medium">{sensor.name}</TableCell>
                    <TableCell>{getStatusBadge(sensor.status)}</TableCell>
                    <TableCell>{sensor.lastReading}</TableCell>
                    <TableCell className={sensor.lastUpdate.includes('hour') ? 'text-red-600' : 'text-muted-foreground'}>
                      {sensor.lastUpdate}
                    </TableCell>
                    <TableCell>
                      {sensor.battery ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-20">
                            <Progress 
                              value={sensor.battery} 
                              className={`h-2 ${sensor.battery < 30 ? 'bg-red-100' : ''}`}
                            />
                          </div>
                          <span className={`text-sm ${sensor.battery < 30 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {sensor.battery}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Network Infrastructure Status</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Node</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Load</TableHead>
                  <TableHead>Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networkNodes.map((node) => (
                  <TableRow key={node.name}>
                    <TableCell className="font-medium">{node.name}</TableCell>
                    <TableCell>{getStatusBadge(node.status)}</TableCell>
                    <TableCell className={node.latency.includes('156') ? 'text-yellow-600' : 'text-muted-foreground'}>
                      {node.latency}
                    </TableCell>
                    <TableCell>{node.uptime}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16">
                          <Progress value={node.load} className="h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground">{node.load}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={node.status === 'Online' ? "default" : "secondary"}>
                        {node.status === 'Online' ? 'Healthy' : 'Degraded'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="h-5 w-5 text-red-500" />
                <h3>Server Temperature</h3>
              </div>
              <div className="text-2xl font-bold">42°C</div>
              <p className="text-sm text-muted-foreground">Normal operating range</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-5 w-5 text-green-500" />
                <h3>Response Time</h3>
              </div>
              <div className="text-2xl font-bold">156ms</div>
              <p className="text-sm text-muted-foreground">Average API response</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-5 w-5 text-blue-500" />
                <h3>Database Operations</h3>
              </div>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-sm text-muted-foreground">Queries per minute</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-4">Performance Metrics (Last 24 Hours)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={systemMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2} name="CPU Usage %" />
                <Line type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={2} name="Memory Usage %" />
                <Line type="monotone" dataKey="storage" stroke="#10b981" strokeWidth={2} name="Storage Usage %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>System Activity Logs</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  Export Logs
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{log.time}</TableCell>
                    <TableCell>{getLogLevelBadge(log.level)}</TableCell>
                    <TableCell className="font-medium">{log.component}</TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}