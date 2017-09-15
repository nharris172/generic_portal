from django.conf.urls import url
from django.conf.urls.static import static

from . import views

JSON_ROOT = '/home/nnh33/sheffield_portal/json'

urlpatterns = [
url(r'^$', views.landing),

]+ static('/json/', document_root=JSON_ROOT)