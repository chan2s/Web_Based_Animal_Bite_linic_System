from django.db import models
from django.contrib.auth.models import User


class Vaccine(models.Model):
    """Vaccine product catalog."""
    
    VACCINE_TYPE_CHOICES = [
        ('rabies', 'Rabies Vaccine'),
        ('tetanus', 'Tetanus Toxoid'),
        ('rabies_ig', 'Rabies Immune Globulin'),
        ('other', 'Other'),
    ]
    
    UNIT_CHOICES = [
        ('vial', 'Vial'),
        ('ampule', 'Ampule'),
        ('dose', 'Dose'),
        ('ml', 'Milliliter'),
    ]
    
    name = models.CharField(max_length=200)
    vaccine_type = models.CharField(max_length=20, choices=VACCINE_TYPE_CHOICES)
    description = models.TextField(blank=True)
    manufacturer = models.CharField(max_length=200, blank=True)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='dose')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vaccines'
        verbose_name = 'Vaccine'
        verbose_name_plural = 'Vaccines'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def current_stock(self):
        """Calculate current available stock."""
        total_in = self.stock_batches.filter(
            transaction_type='in', is_active=True
        ).aggregate(total=models.Sum('quantity'))['total'] or 0
        
        total_out = self.stock_batches.filter(
            transaction_type='out', is_active=True
        ).aggregate(total=models.Sum('quantity'))['total'] or 0
        
        return total_in - total_out


class VaccineBatch(models.Model):
    """Vaccine batch/lot tracking."""
    
    TRANSACTION_TYPE_CHOICES = [
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
    ]
    
    vaccine = models.ForeignKey(
        Vaccine, on_delete=models.CASCADE, related_name='stock_batches'
    )
    batch_number = models.CharField(max_length=100)
    transaction_type = models.CharField(max_length=5, choices=TRANSACTION_TYPE_CHOICES)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # For stock in
    manufacturing_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)
    supplier = models.CharField(max_length=200, blank=True)
    
    # For stock out
    reference_record = models.ForeignKey(
        'vaccinations.VaccinationRecord', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='used_batches'
    )
    
    # Metadata
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='inventory_transactions'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vaccine_batches'
        verbose_name = 'Vaccine Batch'
        verbose_name_plural = 'Vaccine Batches'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['batch_number']),
            models.Index(fields=['expiration_date']),
        ]
    
    def __str__(self):
        return f"{self.vaccine.name} - {self.batch_number} ({self.get_transaction_type_display()})"


class LowStockAlert(models.Model):
    """Configuration for low stock alerts per vaccine."""
    
    vaccine = models.OneToOneField(
        Vaccine, on_delete=models.CASCADE, related_name='low_stock_alert'
    )
    threshold = models.PositiveIntegerField(default=10, help_text="Minimum stock level before alert")
    is_enabled = models.BooleanField(default=True)
    last_triggered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'low_stock_alerts'
        verbose_name = 'Low Stock Alert'
        verbose_name_plural = 'Low Stock Alerts'
    
    def __str__(self):
        return f"{self.vaccine.name} - Threshold: {self.threshold}"
