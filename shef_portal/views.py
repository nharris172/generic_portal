# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

# Create your views here.


def landing(request):
    landing_data = {}

    return render(request,'landing.html',landing_data)