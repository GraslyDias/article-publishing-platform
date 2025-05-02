'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Textarea,
  useToast,
  FormErrorMessage,
  Text,
  Progress,
  Select,
  Flex,
  Alert,
  AlertIcon,
  useColorModeValue,
  Grid,
  IconButton,
  Image,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { CloseIcon } from '@chakra-ui/icons';
import Navbar from '../../components/Navbar';
import API_ENDPOINTS from '@/app/config/api';

// Dummy image URLs for story images
const dummyImages = [
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?w=800',
  'https://images.unsplash.com/photo-1610483778814-70468201824c?w=800',
  'https://images.unsplash.com/photo-1604342427523-21eafb29675c?w=800',
  'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800',
  'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800',
];

export default function CreatePost() {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ 
    title?: string; 
    content?: string;
    category?: string;
    institution?: string;
    customCategory?: string;
  }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDummyImages, setSelectedDummyImages] = useState<string[]>([]);
  const [showDummyImages, setShowDummyImages] = useState(false);

  // Color mode values
  const pageBgColor = useColorModeValue('gray.50', 'gray.900');
  const boxBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.900', 'white');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const errorColor = useColorModeValue('red.500', 'red.300');
  const progressBgColor = useColorModeValue('gray.100', 'gray.600');
  const dummyImageBg = useColorModeValue('gray.100', 'gray.700');
  const dummyImageBorderColor = useColorModeValue('gray.300', 'gray.600');

  // List of institutions for the dropdown
  const institutions = [
    'Technology',
    'Health & Wellness',
    'Business & Finance',
    'Lifestyle',
    'Education',
    'Travel',
    'Food & Cooking',
    'Science',
    'Arts & Entertainment',
    'Sports',
    'Personal Development',
  ];

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast({
        title: 'Login required',
        description: 'You must be logged in to create a post',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      router.push('/auth/login');
      return;
    }

    setIsLoggedIn(true);
  }, [router, toast]);

  const validateForm = () => {
    const newErrors: { 
      title?: string; 
      content?: string;
      category?: string;
      institution?: string;
      customCategory?: string;
    } = {};
    
    if (!title) {
      newErrors.title = 'Title is required';
    }
    
    if (!content) {
      newErrors.content = 'Content is required';
    }
    
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    if (category === 'other' && !customCategory) {
      newErrors.customCategory = 'Please enter a custom category';
    }
    
    if (!institution) {
      newErrors.institution = 'Please enter a topic';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Create preview URLs for new files
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      // Update state
      setImages(prevImages => [...prevImages, ...newFiles]);
      setImagePreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagePreviewUrls(prevUrls => {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(prevUrls[index]);
      return prevUrls.filter((_, i) => i !== index);
    });
  };

  const removeDummyImage = (imageSrc: string) => {
    setSelectedDummyImages(prevImages => 
      prevImages.filter(img => img !== imageSrc)
    );
  };

  const toggleDummyImageSelection = (imageSrc: string) => {
    if (selectedDummyImages.includes(imageSrc)) {
      removeDummyImage(imageSrc);
    } else {
      setSelectedDummyImages(prev => [...prev, imageSrc]);
    }
  };

  // Actual image upload function
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(API_ENDPOINTS.uploadImage, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Image upload failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.file_path;
      } else {
        throw new Error(data.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Handle all image uploads
  const handleImageUpload = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const totalImages = images.length;
    let uploadedCount = 0;
    
    // Process real uploads one by one
    if (images.length > 0) {
      for (const file of images) {
        try {
          // Upload the image
          const imageUrl = await uploadImage(file);
          uploadedUrls.push(imageUrl);
          
          // Update progress
          uploadedCount++;
          setUploadProgress(Math.floor((uploadedCount / totalImages) * 100));
        } catch (error) {
          console.error('Error uploading image:', error);
          // Continue with other uploads even if one fails
        }
      }
    }
    
    // Add selected dummy images
    if (selectedDummyImages.length > 0) {
      uploadedUrls.push(...selectedDummyImages);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !isLoggedIn) return;
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Get user data from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not logged in');
      }
      
      const userData = JSON.parse(userStr);
      const userId = userData.id;
      
      // Handle image upload first
      let imageUrls: string[] = [];
      if (images.length > 0 || selectedDummyImages.length > 0) {
        imageUrls = await handleImageUpload();
      }
      
      console.log('Submitting to:', API_ENDPOINTS.createPost);
      console.log('With images:', imageUrls);
      
      // Make API request to create post
      const response = await fetch(API_ENDPOINTS.createPost, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          title,
          content,
          category: category === 'other' ? customCategory : category,
          institution,
          images: imageUrls.length > 0 ? imageUrls : null
        }),
      });
      
      const data = await response.json();
      console.log('Create post response:', data);
      
      if (response.ok && data.status === 'success') {
        toast({
          title: 'Post created',
          description: data.message || 'Your story has been successfully created',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        
        // Redirect to posts page
        router.push('/posts');
      } else {
        throw new Error(data.message || 'Failed to create post');
      }
    } catch (error: any) {
      console.error('Create post error:', error);
      toast({
        title: 'Failed to create post',
        description: error.message || 'An error occurred while creating your post',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (!isLoggedIn) {
    return (
      <Box bg={pageBgColor} minH="100vh">
        <Navbar />
        <Container maxW="4xl" py={8}>
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Text color={textColor}>You must be logged in to create a post. Redirecting to login...</Text>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={pageBgColor} minH="100vh">
      <Navbar />
      <Container maxW="4xl" py={8}>
        <Box
          bg={boxBgColor}
          p={8}
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Heading as="h1" mb={6} color={headingColor}>
            Share Your Story
          </Heading>
          <Text mb={8} color={mutedTextColor} fontWeight="medium">
            Share your knowledge and ideas with the world. Your article can inspire, educate, and connect with readers worldwide.
          </Text>
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <FormControl isInvalid={!!errors.title}>
                <FormLabel color={labelColor} fontWeight="medium">Title</FormLabel>
                <Input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your story"
                  bg={inputBgColor}
                  color={inputTextColor}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px blue.400",
                  }}
                  _hover={{
                    borderColor: "blue.300",
                  }}
                />
                <FormErrorMessage color={errorColor} fontWeight="medium">{errors.title}</FormErrorMessage>
              </FormControl>
              
              <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                <FormControl isInvalid={!!errors.category}>
                  <FormLabel color={labelColor} fontWeight="medium">Category</FormLabel>
                  <Select 
                    placeholder="Select category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    bg={inputBgColor}
                    color={inputTextColor}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px blue.400",
                    }}
                    _hover={{
                      borderColor: "blue.300",
                    }}
                  >
                    <option value="technology">Technology</option>
                    <option value="health">Health</option>
                    <option value="business">Business</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </Select>
                  <FormErrorMessage color={errorColor} fontWeight="medium">{errors.category}</FormErrorMessage>
                </FormControl>
                
                {category === 'other' && (
                  <FormControl isInvalid={!!errors.customCategory} mt={2}>
                    <FormLabel color={labelColor} fontWeight="medium">Custom Category</FormLabel>
                    <Input 
                      placeholder="Enter your custom category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      bg={inputBgColor}
                      color={inputTextColor}
                      borderColor={borderColor}
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px blue.400",
                      }}
                      _hover={{
                        borderColor: "blue.300",
                      }}
                    />
                    <FormErrorMessage color={errorColor} fontWeight="medium">{errors.customCategory}</FormErrorMessage>
                  </FormControl>
                )}
                
                <FormControl isInvalid={!!errors.institution}>
                  <FormLabel color={labelColor} fontWeight="medium">Topic</FormLabel>
                  <Input
                    list="topic-options"
                    placeholder="Enter or select a topic"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    bg={inputBgColor}
                    color={inputTextColor}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px blue.400",
                    }}
                    _hover={{
                      borderColor: "blue.300",
                    }}
                  />
                  <datalist id="topic-options">
                    {institutions.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </datalist>
                  <Text fontSize="sm" color={mutedTextColor} mt={1}>
                    Select from the suggestions or enter your own custom topic
                  </Text>
                  <FormErrorMessage color={errorColor} fontWeight="medium">{errors.institution}</FormErrorMessage>
                </FormControl>
              </Flex>
              
              <FormControl isInvalid={!!errors.content}>
                <FormLabel color={labelColor} fontWeight="medium">Article Content</FormLabel>
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content here"
                  size="lg"
                  minH="200px"
                  bg={inputBgColor}
                  color={inputTextColor}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px blue.400",
                  }}
                  _hover={{
                    borderColor: "blue.300",
                  }}
                />
                <FormErrorMessage color={errorColor} fontWeight="medium">{errors.content}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel color={labelColor} fontWeight="medium">Upload Images</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  p={2}
                  multiple
                  bg={inputBgColor}
                  color={inputTextColor}
                  borderColor={borderColor}
                />
                <Text fontSize="sm" color={mutedTextColor} mt={1}>
                  Upload one or more images for your article (optional)
                </Text>
              </FormControl>

              {/* Toggle for dummy images */}
              <Button 
                onClick={() => setShowDummyImages(!showDummyImages)} 
                colorScheme="blue" 
                variant="outline" 
                size="sm" 
                alignSelf="flex-start"
                mb={2}
              >
                {showDummyImages ? 'Hide Sample Images' : 'Show Sample Images'}
              </Button>
              
              {/* Dummy images gallery */}
              {showDummyImages && (
                <Box 
                  borderWidth="1px" 
                  borderRadius="md" 
                  p={4} 
                  borderColor={borderColor}
                  bg={dummyImageBg}
                  mb={2}
                >
                  <Text mb={3} fontWeight="medium" color={headingColor}>Select Sample Images:</Text>
                  <Grid templateColumns="repeat(auto-fill, minmax(140px, 1fr))" gap={4}>
                    {dummyImages.map((image, index) => (
                      <Box 
                        key={index} 
                        position="relative"
                        borderWidth="2px"
                        borderRadius="md"
                        overflow="hidden"
                        borderColor={selectedDummyImages.includes(image) ? "blue.500" : dummyImageBorderColor}
                        onClick={() => toggleDummyImageSelection(image)}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ transform: "scale(1.05)" }}
                      >
                        <Image 
                          src={image} 
                          alt={`Sample image ${index + 1}`} 
                          height="100px"
                          width="100%"
                          objectFit="cover"
                        />
                        {selectedDummyImages.includes(image) && (
                          <Box 
                            position="absolute" 
                            top="0" 
                            right="0" 
                            bg="blue.500" 
                            color="white"
                            p={1}
                            fontSize="xs"
                          >
                            ✓
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {/* Image previews */}
              {(imagePreviewUrls.length > 0 || selectedDummyImages.length > 0) && (
                <Box 
                  borderWidth="1px" 
                  borderRadius="md" 
                  p={4} 
                  borderColor={borderColor}
                  mb={2}
                >
                  <Text mb={3} fontWeight="medium" color={headingColor}>
                    Image Previews ({imagePreviewUrls.length + selectedDummyImages.length})
                  </Text>
                  <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4}>
                    {/* Uploaded image previews */}
                    {imagePreviewUrls.map((url, index) => (
                      <Box key={`upload-${index}`} position="relative" borderRadius="md" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
                        <Image 
                          src={url} 
                          alt={`Image ${index + 1}`} 
                          height="100px"
                          width="100%"
                          objectFit="cover"
                        />
                        <IconButton
                          aria-label="Remove image"
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top={1}
                          right={1}
                          onClick={() => removeImage(index)}
                        />
                      </Box>
                    ))}
                    
                    {/* Selected dummy images */}
                    {selectedDummyImages.map((image, index) => (
                      <Box key={`dummy-${index}`} position="relative" borderRadius="md" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
                        <Image 
                          src={image} 
                          alt={`Dummy image ${index + 1}`} 
                          height="100px"
                          width="100%"
                          objectFit="cover"
                        />
                        <IconButton
                          aria-label="Remove image"
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top={1}
                          right={1}
                          onClick={() => removeDummyImage(image)}
                        />
                      </Box>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Box>
                  <Text mb={1} color={mutedTextColor}>
                    Uploading images: {uploadProgress}%
                  </Text>
                  <Progress 
                    value={uploadProgress} 
                    size="sm" 
                    colorScheme="blue" 
                    borderRadius="full"
                    bg={progressBgColor}
                  />
                </Box>
              )}
              
              <Box p={4} borderWidth="1px" borderStyle="dashed" borderRadius="md" borderColor={borderColor}>
                <Text align="center" fontSize="sm" color={mutedTextColor}>
                  <strong>Note:</strong> This form is now connected to the real API. Your story will be saved to the database.
                </Text>
                <Text align="center" fontSize="sm" color={mutedTextColor} mt={2}>
                  Images are now actually uploaded to the server and stored permanently.
                </Text>
              </Box>
              
              <Button
                colorScheme="blue"
                isLoading={isSubmitting}
                type="submit"
                size="lg"
                fontWeight="semibold"
                loadingText={uploadProgress > 0 ? `Uploading images (${uploadProgress}%)...` : "Submitting..."}
              >
                Submit Article
              </Button>
            </Stack>
          </form>
        </Box>
      </Container>
    </Box>
  );
} 