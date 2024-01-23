from django.test import TestCase

# test.py

# tests.py

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core import mail

from backend.users.serializers import UserSerializer

class UserModelTest(TestCase):
    def setUp(self):
        """
        Set up test data for User model tests.
        """
        # Create a regular user
        self.user_data = {
            'email': 'test@example.com',
            'name': 'John',
            'surname': 'Doe',
            'password': 'password123'
        }
        self.user = get_user_model().objects.create_user(**self.user_data)

        # Create a superuser
        self.superuser_data = {
            'email': 'admin@example.com',
            'name': 'Admin',
            'surname': 'User',
            'password': 'adminpassword'
        }
        self.superuser = get_user_model().objects.create_superuser(**self.superuser_data)

    def test_create_user(self):
        """
        Test creating a regular user.
        """
        self.assertEqual(self.user.email, self.user_data['email'])
        self.assertTrue(self.user.check_password(self.user_data['password']))
        self.assertFalse(self.user.is_superuser)
        self.assertFalse(self.user.is_staff)

    def test_create_superuser(self):
        """
        Test creating a superuser.
        """
        self.assertEqual(self.superuser.email, self.superuser_data['email'])
        self.assertTrue(self.superuser.check_password(self.superuser_data['password']))
        self.assertTrue(self.superuser.is_superuser)
        self.assertTrue(self.superuser.is_staff)

    def test_get_full_name(self):
        """
        Test the get_full_name method of the User model.
        """
        full_name = self.user.get_full_name()
        expected_name = f'{self.user.name} {self.user.surname} ( {self.user.email} )'
        self.assertEqual(full_name, expected_name)

    def test_get_short_name(self):
        """
        Test the get_short_name method of the User model.
        """
        short_name = self.user.get_short_name()
        expected_name = f'{self.user.name}{self.user.surname}'
        self.assertEqual(short_name, expected_name)

    def test_create_auth_token_signal(self):
        """
        Test the creation of an authentication token using a signal.
        """
        token = self.user.auth_token
        self.assertIsNotNone(token)

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