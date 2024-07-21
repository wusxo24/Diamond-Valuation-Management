import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AOS from 'aos'; // Import AOS library
import 'aos/dist/aos.css'; // Import AOS CSS
import React, { useEffect } from "react";
import { useInView } from 'react-intersection-observer';
import CustomerLayout from "../../components/CustomerLayout";

const AboutUsCustomer = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Global duration for all animations
      once: true, // Only animate elements once
    });
  }, []);

  const { ref: aboutRef, inView: aboutInView } = useInView({ triggerOnce: true });
  const { ref: missionRef, inView: missionInView } = useInView({ triggerOnce: true });
  const { ref: whyChooseRef, inView: whyChooseInView } = useInView({ triggerOnce: true });

  const sectionStyles = {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: 'center',
    marginBottom: '40px',
    padding: '40px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const imageStyles = {
    width: '100%',
    height: 'auto',
    borderRadius: '10px',
  };

  const textStyles = {
    color: '#444',
    textAlign: 'left',
    fontSize: '18px',
    lineHeight: '1.6',
  };

  const titleStyles = {
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: '20px',
  };

  return (
    <CustomerLayout>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', minHeight: '100vh', backgroundColor: '#f0f0f0' }} />

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{
          width: '97%',
          padding: '50px 20px',
          textAlign: 'center',
          marginTop: '90px'
        }}
      >
        <Box
          data-aos="fade-right"
          ref={aboutRef}
          sx={sectionStyles}
        >
          <Box sx={{ flex: 1, paddingRight: { md: '20px' }, paddingBottom: { xs: '20px', md: '0' } }}>
            <Typography variant="h4" sx={titleStyles}>
              Leading the Way in Diamond Valuation
            </Typography>
            <Typography variant="body1" paragraph sx={textStyles}>
              At DiamondScope, we prioritize the needs of diamond enthusiasts worldwide by providing
              accurate and reliable assessments of diamond quality and worth. Our expert team
              leverages extensive knowledge and state-of-the-art technology to deliver precise
              evaluations, ensuring our clients receive the most trustworthy valuations available.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <img
              src="https://static.vecteezy.com/system/resources/thumbnails/023/035/741/small_2x/diamond-is-a-rare-precious-natural-geological-stone-on-a-black-background-ai-generated-header-banner-mockup-with-space-photo.jpg"
              alt="Diamond Valuation"
              style={imageStyles}
            />
          </Box>
        </Box>

        <Box
          data-aos="fade-left"
          ref={missionRef}
          sx={{
            ...sectionStyles,
            flexDirection: { xs: 'column', md: 'row-reverse' },
            backgroundColor: '#ffffff',
          }}
        >
          <Box sx={{ flex: 1, paddingLeft: { md: '20px' }, paddingBottom: { xs: '20px', md: '0' }, textAlign: { xs: 'center', md: 'right' } }}>
            <Typography variant="h4" sx={titleStyles}>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph sx={textStyles}>
              We empower clients with knowledge and confidence in the diamond market. Upholding
              integrity, transparency, and excellence, our assessments demystify diamond valuation
              complexities, fostering understanding of true value.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <img
              src="https://www.jewelrycult.com/wp-content/uploads/2016/02/jewelry-appraiser.jpg"
              alt="Our Mission"
              style={{ ...imageStyles, objectFit: 'cover', transform: 'scaleX(-1)' }}
              data-aos="flip-right"
            />
          </Box>
        </Box>

        <Box
          data-aos="fade-up"
          ref={whyChooseRef}
          sx={sectionStyles}
        >
          <Box sx={{ flex: 1, paddingRight: { md: '20px' }, paddingBottom: { xs: '20px', md: '0' } }}>
            <Typography variant="h4" sx={titleStyles}>
              Why Choose Us?
            </Typography>
            <Typography variant="body1" paragraph sx={textStyles}>
              With over 69 years of combined experience in the diamond industry, our team offers
              unparalleled expertise and insights. We utilize state-of-the-art technology and
              methodologies to ensure precise and accurate valuations.
              <br /><br />
              Our services are trusted by both industry leaders and private clients alike, underscoring
              our commitment to excellence and reliability.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <img
              src="https://us.123rf.com/450wm/kwangmoo/kwangmoo1803/kwangmoo180300994/98582086-luxury-jewelry-diamond-rings-with-reflection-on-black-background.jpg?ver=6"
              alt="Why Choose Us"
              style={imageStyles}
              data-aos="flip-left"
            />
          </Box>
        </Box>

        <Box
          data-aos="fade-up"
          ref={whyChooseRef}
          sx={{
            ...sectionStyles,
            flexDirection: { xs: 'column', md: 'row-reverse' },
            backgroundColor: '#ffffff',
          }}
        >
          <Box sx={{ flex: 1, paddingLeft: { md: '20px' }, paddingBottom: { xs: '20px', md: '0' }, textAlign: { xs: 'center', md: 'right' } }}>
            <Typography variant="h4" sx={titleStyles}>
              Trusted Diamond Valuation
            </Typography>
            <Typography variant="body1" paragraph sx={textStyles}>
              Whether you are buying, selling, or insuring diamonds, DiamondScope provides the assurance
              you need through our rigorous and detailed valuation process. Our commitment to accuracy
              and reliability means you can trust us with your most valuable assets. We strive to deliver
              the highest standards of service and transparency, ensuring every client receives the best
              possible experience.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <img
              src="https://abrn.asia/ojs/public/journals/3/article_66_cover_en_US.jpg"
              alt="Trusted Diamond Valuation"
              style={imageStyles}
              data-aos="flip-right"
            />
          </Box>
        </Box>
      </Box>
    </CustomerLayout>
  );
};

export default AboutUsCustomer;
