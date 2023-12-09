from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.core.mail import EmailMessage, send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str


from .models import User
from .serializers import UserSerializer


class UserLogInView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request':request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token = Token.objects.get_or_create(user=user)
        return Response({
            'message':'User successfully logged in.',
            'token':token[0].key,
            'user_id':user.pk,
            'email':user.email,
        })


class UserLogOutView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        request.user.auth_token.delete()
        return Response({
            'message':'User successfully logged out.'
        })
    

class UserSignUpView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data,
                                    context={'request':request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = Token.objects.get_or_create(user=user)

        mail1_subject = "Welcome to DataStreamAnalytics!"
        mail1_message = f"Hello {user.name}!\nWelcome to DataStreamAnalytics app!\nWe have sent you a confirmation email, please confirm your email address.\n\nBest regards,\nDataStreamAnalytics team"
        
        encoded_uid = urlsafe_base64_encode(force_bytes(user.pk))
        encoded_token = urlsafe_base64_encode(force_bytes(token[0].key))
        mail2_subject = "Confirm your email address in DataStreamAnalytics!"
        mail2_message = f"Hello {user.name}!\nPlease confirm your email address by clicking the link below:\n\nhttp://localhost:4200//activate/{encoded_uid}/{encoded_token}\n\nBest regards,\nDataStreamAnalytics team"
        
        from_email = settings.EMAIL_HOST_USER
        to_list = [user.email]
        send_mail(mail1_subject, mail1_message, from_email, to_list, fail_silently=True)
        send_mail(mail2_subject, mail2_message, from_email, to_list, fail_silently=True)

        return Response({
            'message':'User successfully created.',
            'token':token[0].key,
            'user_id':user.pk,
            'email':user.email,
        })
    

class UserActivateView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        print(request.data)
        uid = force_str(urlsafe_base64_decode(request.data['uid']))
        token = force_str(urlsafe_base64_decode(request.data['token']))
        user = User.objects.get(pk=uid)
        if user is not None and user.is_active == False:
            if token == user.auth_token.key:
                user.is_active = True
                user.save()
                return Response({
                    'message':'User successfully activated.',
                })
            return Response({
                'message':'Invalid token.',
            })
        return Response({
            'message':'User already activated.',
        })
