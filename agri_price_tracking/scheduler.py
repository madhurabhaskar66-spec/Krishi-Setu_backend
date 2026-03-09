from apscheduler.schedulers.background import BackgroundScheduler
from price_service import update_prices

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(update_prices, 'interval', seconds=20)
    scheduler.start()