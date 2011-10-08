# -*- coding: utf-8 -*-
#from django import template
from django import template
from django.template import Library, TextNode, TOKEN_BLOCK, TOKEN_VAR, NodeList

register = Library()
import settings

def app_settings(setting_attr):
    """
    возвращает соответсвующие настройки приложения. 
    Аналогично использованию во views settings.SOME_PROPERTIES
    """
    return settings.__getattribute__(setting_attr) 

# регистрируем как settings, дабы не было путаницы
register.filter('settings',app_settings)

@register.tag
def jqtpl(parser, token):
    """
    Для jquery templates
    использование: 
    {% jqtpl "id_name" %} 
        {# здесь сырой текст, который не обрабатывается #}
        {{ some_text }} {# на экран выведется {{some_text}} #}
    {% endjqtpl%}
    на выходе получим
    <script id='id_name' type='text/x-jquery-tmpl'>
        {{ some_text }} 
    </script>
    """
    tag_name, id_name = token.split_contents()
    end_tag = 'end' + tag_name
    nodes = []
    while True:
        t = parser.next_token()
        if t.token_type == TOKEN_BLOCK:
            if(t.contents == end_tag):
                break
            nodes.extend(["{%", t.contents, "%}"])
        elif t.token_type == TOKEN_VAR:
            nodes.extend(["{{", t.contents, "}}"])
        else:
            nodes.append(t.contents)
    
    return TextNode(
        "<script id=%s type='text/x-jquery-tmpl'> %s </script>" % (id_name, ''.join(nodes))
    )

@register.tag
def sass(parser, token):
    """
    компилирует css файл из одноименного sass файла
    использование {% sass 'path.to.style.css' %}
    но если settings.DEBUG == False или USE_SASS == False - компиляция не производится
    """
    tag_name, css_path = token.split_contents()
    return Sass(css_path)

class Sass(template.Node):
    """compile name.css from name.sass"""
    def __init__(self, css_path):
        # get full path to css
        self.css_path = css_path[1: -1]


    def render(self, context):
        # если не установлено в настройках использовать sass
        # то ничего не компилируем, просто отдаем что взяли
        try:
            use_sass = settings.USE_SASS

            # on production just return css_path 
            if not settings.DEBUG:
                return self.css_path
        except:
            return self.css_path

        import os
        css_full_path = os.path.join(settings.STATIC_ROOT, self.css_path)

        path, css = os.path.split(css_full_path)
        sass = css.split('.')[0] + ".sass"
        sass_full_path = os.path.join(path, sass)

        from commands import getstatusoutput
        
        status, output = getstatusoutput('sass %s %s' % (sass_full_path, css_full_path))
        if status:
            raise Exception('Sass error. \n Status - %s. \n Error - %s' % (status, output) )

        return self.css_path

