  import { useState } from 'react';
import axios from 'axios';

import {
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress
} from '@mui/material';

import './App.css';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:8080/api/email/generate',
        {
          emailContent,
          tone
        }
      );

      setGeneratedReply(
        typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data)
      );

    } catch (error) {
      setError('Failed to generate the email reply. Please try again');
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>

      <Typography variant="h3" component="h1" gutterBottom>
        Email Reply Generator
      </Typography>

      <Box sx={{ mx: 3 }}>

        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          label="Original Email Content"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tone (Optional)</InputLabel>

          <Select
            value={tone}
            label="Tone (Optional)"
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="Professional">Professional</MenuItem>
            <MenuItem value="Casual">Casual</MenuItem>
            <MenuItem value="Friendly">Friendly</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!emailContent || loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Reply'}
        </Button>

      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {generatedReply && (
        <Box sx={{ mt: 3 }}>

          <Typography variant="h6" gutterBottom>
            Generated Reply:
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={generatedReply}
            InputProps={{
              readOnly: true
            }}
          />

          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(generatedReply)}
          >
            Copy to Clipboard
          </Button>

        </Box>
      )}

    </Container>
  );
}

export default App;
// import { useState } from 'react';
// import {
//   Container,
//   Typography,
//   Box,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Button,
//   CircularProgress
// } from '@mui/material';

// import './App.css';

// function App() {
//   const [emailContent, setEmailContent] = useState('');
//   const [tone, setTone] = useState('');
//   const [generatedReply, setGeneratedReply] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const handleSubmit=async ()=>{
//      setLoading=true;
//      setError('');
//      try{
//         const response= await axios.post("http://localhost:8080/api/email/generate" ,{
//           emailContent,
//           tone
//         });
//         setGeneratedReply(typeof response.data === 'string'? response.data:JSON.stringify(response.data));
//      }catch(error){
//         setError('Failed to generate the email reply.Please try again');
//         console.error(error);
//      }finally{
//       setLoading(false);
//      }
//   };
//   return (
//     <Container maxWidth="md" sx={{ py: 4 }}>
      
//       <Typography variant="h3" component="h1" gutterBottom>
//         Email Reply Generator
//       </Typography>

//       <Box sx={{ mx: 3 }}>

//         <TextField
//           fullWidth
//           multiline
//           rows={6}
//           variant="outlined"
//           label="Original Email Content"
//           value={emailContent}
//           onChange={(e) => setEmailContent(e.target.value)}
//           sx={{ mb: 2 }}
//         />

//         <FormControl fullWidth sx={{mb:2}}>
//           <InputLabel>Tone (Optional)</InputLabel>

//           <Select
//             value={tone}
//             label="Tone (Optional)"
//             onChange={(e) => setTone(e.target.value)}
//           >
//             <MenuItem value="">None</MenuItem>
//             <MenuItem value="Professional">Professional</MenuItem>
//             <MenuItem value="Casual">Casual</MenuItem>
//             <MenuItem value="Friendly">Friendly</MenuItem>
//           </Select>
//         </FormControl>
//         <Button varient='contained'
//                 onClick={handleSubmit}
//                 disabled={!emailContent || loading}
//                 fullWidth>
//                 {loading ? <CircularProgress size={24}/>  : "Generate Reply"}
//         </Button>

//       </Box>
//       {error && (
//           <Typography color='error' sx={{mb:2}}>
//              {error}
//           </Typography>
//       )}
//       {generatedReply && (
//         <Box sx={{mt:3}}>
//           <Typography varient='h6' gutterBottom>
//             Generated Reply:
//           </Typography>

//           <TextField>
//              fullWidth
//              multiline
//              rows={6}
//              varient='outlined'
//              value={generatedReply || ''}
//              inputProps={{readOnly:true}}
//           </TextField>
//           <button varient='outlined' sx={{mt:2}} onClick={()=> navigator.clipboard.writerText(generateReply)}>
//                Copy to ClipBoard
//           </button>
//         </Box>
//       )}
//     </Container>
//   )
// }

// export default App;
