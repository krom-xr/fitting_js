from django.shortcuts import render_to_response

def index(request):
    """docstring for in"""
    return render_to_response("index.html")

def test(request):
    """docstring for te"""
    return render_to_response("test.html")
