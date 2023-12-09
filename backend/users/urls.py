from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework.routers import DefaultRouter
from users import views

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'users', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', views.UserSignUpView.as_view()),
    path('activate/', views.UserActivateView.as_view()),
    path('login/', views.UserLogInView.as_view()),
    path('logout/', views.UserLogOutView.as_view()),
    path('auth/', include('rest_framework.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = format_suffix_patterns(urlpatterns)