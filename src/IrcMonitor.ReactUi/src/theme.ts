import { createTheme } from '@mui/material/styles';

export const createIrcTheme = (mode: 'light' | 'dark') => {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: dark ? '#FFC107' : '#8A5700',
        contrastText: dark ? '#17191C' : '#FFFFFF',
      },
      secondary: {
        main: dark ? '#5EEAD4' : '#00796B',
        contrastText: dark ? '#17191C' : '#FFFFFF',
      },
      background: {
        default: dark ? '#121416' : '#F7F8FA',
        paper: dark ? '#1C1F23' : '#FFFFFF',
      },
      text: {
        primary: dark ? '#F3F4F6' : '#202428',
        secondary: dark ? '#AAB2BD' : '#59636E',
      },
      divider: dark ? '#343A42' : '#DDE1E6',
      success: { main: dark ? '#81C784' : '#2E7D32' },
      warning: { main: dark ? '#FFB74D' : '#A64B00' },
      error: { main: dark ? '#FF8A80' : '#C62828' },
      info: { main: dark ? '#90CAF9' : '#1565C0' },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiAppBar: {
        defaultProps: { color: 'transparent', elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
    },
  });
};
