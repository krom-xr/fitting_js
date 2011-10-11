from django.conf.urls.defaults import patterns, include, url
import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'views.index', name='home'),
    (r'^dressing-room/$', 'views.dressing'),

    (r'^test/$', 'views.test'),

    (r'^proxy/(?P<url>.*)$', 'httpproxy.views.proxy'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    # urls for normally static use
    (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
    (r'^(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
    
)
