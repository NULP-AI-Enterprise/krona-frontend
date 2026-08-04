import {
    Avatar, Paper, Box, Stack, Grid, Typography, Button, Alert, Snackbar
} from '@mui/material';
import {useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './UserPage.css';


function stringToColor(string) {
  if (!string) return '#000000';
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  if (!name) return { sx: { bgcolor: '#ccc' }, children: '?' };
  let child
  if (name.indexOf(' ') == -1) {
    child = `${name[0]}`
  } else {
    child = `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`
  }
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 70, height: 70,
      fontSize: '27px',
      fontWeight: 'bold'
    },
    children: child,
  };
}


const UserPage = () => {

  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [userData, setUserData] = useState({
    role: localStorage.getItem('user_role') || 'USER',
    name: localStorage.getItem('user_full_name') || '',
    email: localStorage.getItem('user_email') || '',
    phone: localStorage.getItem('user_phone_number') || ''
  });

  const user_roles = {
    'SUPER_ADMIN': 'головний адміністратор',
    'ADMIN': 'адміністратор',
    'COMPILER': 'укладач',
    'USER': 'користувач'
  }

  const [formData, setFormData] = useState({
    full_name: userData.name,
    email: userData.email,
    phone_number: userData.phone,
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_full_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_phone_number');
    localStorage.removeItem('concordance_selected_collection');

    setEditMode(false);
    navigate('/');
  };

  const handleEditUser = () => {
    setEditMode(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch('http://localhost:8000/api/auth/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
      }
    } catch (e) {
      console.error('Помилка оновлення токена:', e);
    }
    return null;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      let token = localStorage.getItem('access_token');
      if (!token) return;

      let response = await fetch('http://localhost:8000/api/auth/profile/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) return;
        response = await fetch('http://localhost:8000/api/auth/profile/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user_full_name', data.full_name || '');
        localStorage.setItem('user_email', data.email || '');
        localStorage.setItem('user_role', data.role || 'USER');
        localStorage.setItem('user_phone_number', data.phone_number || '');
        setUserData({
          role: data.role || 'USER',
          name: data.full_name || '',
          email: data.email || '',
          phone: data.phone_number || '',
        });
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
        });
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let token = localStorage.getItem('access_token');

    const sendRequest = async (authToken) => {
      return await fetch('http://localhost:8000/api/auth/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          full_name: formData.full_name,
        }),
      });
    };

    setIsLoading(true);

    try {
      let response = await sendRequest(token);

      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          response = await sendRequest(newToken);
        } else {
          handleLogout();
          return;
        }
      }

      const data = await response.json();

      if (response.ok) {
        const updatedName = data.full_name || formData.full_name;
        localStorage.setItem('user_full_name', updatedName);
        setUserData((prev) => ({ ...prev, name: updatedName }));
        setEditMode(false);
        setToast({
          open: true,
          message: 'Дані успішно оновлено!',
          severity: 'success',
        });
      } else {
        setToast({
          open: true,
          message: 'Не вдалося оновити дані.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error(error);
      setToast({
        open: true,
        message: 'Помилка з\'єднання з сервером.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      full_name: userData.name,
      email: userData.email,
      phone_number: userData.phone,
    });

  }

  const handleLogoutUser = () => {
    if (window.confirm(`Ви дійсно хочете вийти з акаунту?`)) {
        handleLogout();
    }
  };

  const handleCloseToast = (event, reason) => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const colors = {
      bgMain: 'var(--color-bg-light, #F0ECE1)',
      bgCorpusRow: 'var(--color-accent-green, #677424)',
      btnOutline: 'var(--color-accent-green, #677424)',
      textBrown: 'var(--color-text-main, #5A3E29)',
      bgDrawerBtn: 'var(--color-btn-hover, #40342B)',
      bgSec: 'var(--color-bg-main, #BBC191)',
      addText: 'var(--color-addittional-text, #8A5D3C)'
  };
  return(
    <Box>
      <Grid container >
        <Grid size={4}>
          <Stack justifyContent='center' alignItems = 'center'>
              <Paper
                elevation={24} variant="outlined" 
                sx = {{
                  boxShadow: 7,
                  background: colors.bgMain,
                  padding: "1rem",
                  border: "2px solid",
                  borderColor : colors.bgCorpusRow,
                  borderRadius: '20px',
                  minWidth: '309px',
                }}
              >
                <Stack spacing={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                    <Avatar
                      {...stringAvatar(userData.name)}
                    />
                    { !editMode && (<>
                        <Typography 
                          sx={{
                            color: colors.textBrown,
                            fontWeight: "bold",
                            fontSize: '24px',
                            
                          }}
                        >
                          {userData.name}
                        </Typography>
                        <Typography
                          sx={{
                            color : colors.addText,
                            fontSize: '14px',
                            mt : '-5px',
                            fontFamily: 'Georgia'
                          }}
                        >
                          {user_roles[userData.role]}
                        </Typography>
                      </>)
                    }
                  </Box>
                  
                  {editMode ? 
                    (
                      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div>
                          <label className="edit-form-label">Ім’я</label>
                          <input
                            type="text"
                            name="full_name"
                            className="edit-form-control"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="edit-form-label">Пошта</label>
                          <input
                            type="email"
                            name="email"
                            className="edit-form-control"
                            value={formData.email}
                            disabled
                          />
                        </div>
                        {/* Неробочий функціонал */}
                        {/* <p className="edit-form-link"><a href='' className='edit-form-link'>Змінити</a></p> */}
                        <div>
                          <label className="edit-form-label">Номер телефону</label>
                          <input
                            type="tel"
                            name="phone_number"
                            className="edit-form-control"
                            value={formData.phone_number}
                            disabled
                          />
                        </div>
                        {/* Неробочий функціонал */}
                        {/* <p className="edit-form-link"><a href='' className='edit-form-link'>Змінити</a></p> */}

                        <Box display="flex" justifyContent="center" gap={2} mt={1}>
                          <Button
                            type="submit"
                            disabled={isLoading}
                            variant="contained"
                            sx={{
                              backgroundColor: colors.btnOutline,
                              color: colors.bgMain,
                              borderRadius: '10px',
                              fontSize: '12px',
                              '&:hover': { backgroundColor: '#5C6E1C' }
                            }}
                          >
                            {isLoading ? 'Збереження...' : 'Зберегти'}
                          </Button>
                          <Button
                            onClick={handleCancel}
                            variant="contained"
                            sx={{
                              backgroundColor: colors.bgSec,
                              color: colors.textBrown,
                              borderRadius: '10px',
                              fontSize: '12px',
                              '&:hover': { backgroundColor: '#AEB57D' }
                            }}
                          >
                            Скасувати
                          </Button>
                        </Box>
                      </Box>
                    )
                      :
                    (<><Box sx={{justifyContent: "left", alignItems: "left",}}>
                      <Typography
                        sx={{
                          color : colors.btnOutline,
                          fontSize : '14px',
                          mb : '-5px',
                          paddingLeft : '5px',
                          fontFamily: 'Georgia'
                        }}
                      >
                        Пошта
                      </Typography>
                      <Typography
                        sx={{
                          color : colors.textBrown,
                          fontSize : '18px',
                          fontFamily: 'Georgia'
                        }}
                      >
                        {userData.email}
                      </Typography>
                      <Typography
                        sx={{
                          color : colors.btnOutline,
                          fontSize : '14px',
                          mb : '-5px',
                          paddingLeft : '5px',
                          fontFamily: 'Georgia'
                        }}
                      >
                        Номер телефону
                      </Typography>
                      <Typography
                        sx={{
                          color : colors.textBrown,
                          fontSize : '18px',
                          fontFamily: 'Georgia'
                        }}
                      >
                        {userData.phone}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center">
                      <Button
                        variant="contained"
                        onClick={handleEditUser}
                        sx={{
                          backgroundColor: colors.addText,
                          color: colors.bgMain,
                          borderRadius: '10px',
                          fontSize: '12px',
                          '&:hover': { backgroundColor: '#834E2F' }
                        }}
                      >
                        Редагувати профіль
                      </Button>
                    </Box>
                    </>
                    )
                  }
                </Stack>
              </Paper>
              <Button
                onClick={handleLogoutUser}
                variant="contained"
                sx={{ 
                  maxwidth: "10%", p: '10px 15px 10px 15px', my: 2,
                  backgroundColor : "#CD0A0A", 
                  borderRadius: '15px',
                  color : colors.bgMain,
                  fontSize: '14px',
                  '&:hover': {
                    backgroundColor: '#B60602',
                    color : colors.bgMain
                  },
                }}
              >
                Вийти
              </Button>
          </Stack>
        </Grid>
        <Grid size={8}></Grid>
      </Grid>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        ClickAwayListenerProps={{
          onClickAway: handleCloseToast
        }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          variant="filled"
          sx={{ width: '100%', boxShadow: 3, bgcolor: colors.bgSec, color: colors.textBrown, }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
export default UserPage;