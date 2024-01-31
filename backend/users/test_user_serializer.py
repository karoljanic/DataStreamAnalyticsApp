from django.test import TestCase

from .serializers import UserSerializer

class UserSerializerTest(TestCase):
    def setUp(self):
        """
        Set up test data for UserSerializer tests.
        """
        self.user_data = {
            'email': 'test@example.com',
            'name': 'John',
            'surname': 'Doe',
            'password': 'password123'
        }

    def test_valid_user_serializer_data(self):
        """
        Test the UserSerializer with valid data.
        """
        # Create a serializer instance with valid data
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        
        # Check if the serializer saves the user correctly
        user = serializer.save()
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.name, self.user_data['name'])
        self.assertEqual(user.surname, self.user_data['surname'])

        # Check if the user password is set correctly
        self.assertTrue(user.check_password(self.user_data['password']))

    def test_invalid_user_serializer_data(self):
        """
        Test the UserSerializer with invalid data.
        """
        # Create a serializer instance with invalid data
        invalid_data = {
            'email': 'invalid_email',
            'name': '',
            'surname': '',
            'password': ''
        }
        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())

        # Check if serializer errors match the expected validation errors
        expected_errors = {
            'email': ['Enter a valid email address.'],
            'name': ['This field may not be blank.'],
            'surname': ['This field may not be blank.'],
            'password': ['This field may not be blank.']
        }
        self.assertEqual(serializer.errors, expected_errors)