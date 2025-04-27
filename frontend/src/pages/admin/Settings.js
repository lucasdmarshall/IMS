import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';
import { message, Card, Form, Input, Switch, Select, Button, Divider, Tooltip } from 'antd';

const { Option } = Select;

const AdminSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Inventory Management System',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    lowStockThreshold: 10,
    enableNotifications: true,
    enableDebugMode: false,
    defaultLanguage: 'en',
    sessionTimeout: 30,
    backupFrequency: 'daily',
  });

  useEffect(() => {
    // Fetch settings from the backend
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/settings');
        if (response.data && response.data.status === 'success') {
          const fetchedSettings = response.data.data;
          setSettings(fetchedSettings);
          form.setFieldsValue(fetchedSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        message.error(t('Failed to load settings'));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [form, t]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put('/settings', values);
      if (response.data && response.data.status === 'success') {
        setSettings(response.data.data);
        message.success(t('Settings saved successfully'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error(t('Failed to save settings'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/settings/reset');
      if (response.data && response.data.status === 'success') {
        const resetSettings = response.data.data;
        setSettings(resetSettings);
        form.setFieldsValue(resetSettings);
        message.success(t('Settings reset to defaults'));
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      message.error(t('Failed to reset settings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A2238] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-300 hover:text-white bg-gray-800/30 hover:bg-gray-700/50 rounded-lg px-3 py-2 transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {t('System Settings')}
          </h1>
        </div>

        <Card 
          className="bg-[rgba(26,34,56,0.9)] border border-gray-700 rounded-xl shadow-xl"
          styles={{ body: { padding: '24px' } }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={settings}
            className="text-gray-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {t('General Settings')}
                </h2>
                
                <Form.Item
                  name="companyName"
                  label={<span className="text-gray-300">{t('Company Name')}</span>}
                  rules={[{ required: true, message: 'Please enter company name' }]}
                >
                  <Input 
                    placeholder="Enter company name" 
                    className="bg-gray-800/50 border-gray-700 text-gray-300"
                  />
                </Form.Item>
                
                <Form.Item
                  name="currency"
                  label={<span className="text-gray-300">{t('Currency')}</span>}
                  rules={[{ required: true, message: 'Please select currency' }]}
                >
                  <Select 
                    placeholder="Select currency"
                    className="bg-gray-800/50 border-gray-700 text-gray-300"
                    popupClassName="bg-gray-800 border-gray-700"
                  >
                    <Option value="USD">USD ($)</Option>
                    <Option value="EUR">EUR (€)</Option>
                    <Option value="GBP">GBP (£)</Option>
                    <Option value="JPY">JPY (¥)</Option>
                    <Option value="INR">INR (₹)</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="defaultLanguage"
                  label={<span className="text-gray-300">{t('Default Language')}</span>}
                  rules={[{ required: true, message: 'Please select language' }]}
                >
                  <Select 
                    placeholder="Select language"
                    className="bg-gray-800/50 border-gray-700 text-gray-300"
                    popupClassName="bg-gray-800 border-gray-700"
                  >
                    <Option value="en">English</Option>
                    <Option value="fr">French</Option>
                  </Select>
                </Form.Item>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {t('Display Settings')}
                </h2>
                
                <Form.Item
                  name="dateFormat"
                  label={<span className="text-gray-300">{t('Date Format')}</span>}
                  rules={[{ required: true, message: 'Please select date format' }]}
                >
                  <Select 
                    placeholder="Select date format"
                    className="bg-gray-800/50 border-gray-700 text-gray-300"
                    popupClassName="bg-gray-800 border-gray-700"
                  >
                    <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                    <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="timeFormat"
                  label={<span className="text-gray-300">{t('Time Format')}</span>}
                  rules={[{ required: true, message: 'Please select time format' }]}
                >
                  <Select 
                    placeholder="Select time format"
                    className="bg-gray-800/50 border-gray-700 text-gray-300"
                    popupClassName="bg-gray-800 border-gray-700"
                  >
                    <Option value="12h">12-hour (AM/PM)</Option>
                    <Option value="24h">24-hour</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="lowStockThreshold"
                  label={<span className="text-gray-300">{t('Low Stock Threshold')}</span>}
                  rules={[{ required: true, message: 'Please enter threshold value' }]}
                >
                  <Input 
                    type="number" 
                    min={1}
                    placeholder="Enter threshold value" 
                    className="bg-gray-800/50 border-gray-700 text-gray-300"
                  />
                </Form.Item>
              </div>
            </div>
            
            <Divider className="border-gray-700" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {t('Notification Settings')}
                </h2>
                
                <Form.Item
                  name="enableNotifications"
                  label={<span className="text-gray-300">{t('Enable Notifications')}</span>}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="sessionTimeout"
                  label={<span className="text-gray-300">{t('Session Timeout (minutes)')}</span>}
                  rules={[{ required: true, message: 'Please enter session timeout' }]}
                >
                  <Input 
                    type="number" 
                    min={5}
                    max={120}
                    placeholder="Enter timeout in minutes" 
                    className="bg-gray-800/50 border-gray-700 text-gray-300"
                  />
                </Form.Item>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {t('System Settings')}
                </h2>
                
                <Form.Item
                  name="backupFrequency"
                  label={<span className="text-gray-300">{t('Backup Frequency')}</span>}
                  rules={[{ required: true, message: 'Please select backup frequency' }]}
                >
                  <Select 
                    placeholder="Select backup frequency"
                    className="bg-gray-800/50 border-gray-700 text-gray-300"
                    popupClassName="bg-gray-800 border-gray-700"
                  >
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="manual">Manual Only</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="enableDebugMode"
                  label={
                    <Tooltip title="Enable this only for troubleshooting">
                      <span className="text-gray-300">{t('Debug Mode')}</span>
                    </Tooltip>
                  }
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                icon={<RefreshCw size={16} />}
                onClick={handleReset}
                className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300"
              >
                {t('Reset')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<Save size={16} />}
                loading={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-none"
              >
                {t('Save Settings')}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
