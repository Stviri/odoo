from odoo import models, fields
from datetime import datetime
# datetime გამოიყენება იმისთვის რომ როდესაც მოხდება განცხადების დადება შესაბამისი დღის თარიღი გაიწეროს.
default_availability_date = datetime.now()
class EstateProperty(models.Model):
    _name = "estate.property"
    _description = "Estate Properties"
    # ქვემოთ მოცემული Field-ებით ხდება უძრავი ქონების პარამეტრების გაწერა.
    active = fields.Boolean(string='აქტიური', default=True)
    state = fields.Selection(
        string='განცხადების სტატუსი',
        selection=[
            ('ახალი','ახალი'),
            ('გაყიდული','გაყიდული'),
            ('გაუქმებული','გაუქმებული')
        ],
        required=True,
        copy=False,
        default='ახალი'
    )
    name = fields.Char(string='სახელი', required=True)
    description = fields.Text(string='აღწერა', required=True)
    postcode = fields.Char(string='საფოსტო ინდექსი')
    date_availability = fields.Date(string='განცხადების დამატების თარიღი', default=default_availability_date, copy=False)
    selling_price = fields.Float(string='ფასი $', copy=False)
    bedrooms = fields.Integer(string='საძინებლები', default='2')
    living_area = fields.Integer(string='საცხოვრებელი არეალი მ²')
    facades = fields.Integer(string='აივანი')
    garage = fields.Boolean(string='გარაჟი')
    garden = fields.Boolean(string='ეზო')
    garden_area = fields.Integer(string='ეზოს არეალი მ²')
