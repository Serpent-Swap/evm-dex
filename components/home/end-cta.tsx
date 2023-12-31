import { Grid, Paper, Typography, Button } from '@mui/material'
import Link from 'next/link'

const EndCta = () => {
  return (
    <Grid
      container
      spacing={2}
      pt={'70px'}
    >
      <Grid item xs={12}>
        <Paper
          sx={{
            p: '60px',
            textAlign: 'center',
          }}
        >
          <Grid container justifyContent={'center'} gap={'60px'}>
            <Grid item xs={12} md={8} alignItems={'center'} textAlign={'center'}>
              <Typography variant='h2' mt={'60px'} mb={'20px'}>Ready to dive into the world of crypto?</Typography>
              <Typography mb={'20px'}>Interact with the future of digital finance with Serpent Swap. Whether you are a seasoned trader or just starting your journey, we&apos;ve got you covered.</Typography>
              <Link href="/application/swap">
                <Button variant='contained' size='large'>Launch app</Button>
              </Link>
            </Grid>
            <Grid item xs={12}>
              <img src={'/illustrations/plug.png'} alt={'cta'} style={{ maxWidth: '100%' }} />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default EndCta