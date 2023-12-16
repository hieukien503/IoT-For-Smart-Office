import datetime
import pytz

def convert_utc_timestamp(utc_timestampt: str) -> str:
    print("utc_timestampt", utc_timestampt)
    utc_timestamp = datetime.datetime.strptime(utc_timestampt, "%Y-%m-%dT%H:%M:%S.%fZ").timestamp()
    hcm_tz = pytz.timezone('Asia/Ho_Chi_Minh')
    hcm_datetime = datetime.datetime.utcfromtimestamp(utc_timestamp).replace(tzinfo=pytz.utc).astimezone(hcm_tz) + datetime.timedelta(hours=7)
    
    return hcm_datetime.strftime("%Y-%m-%d %H:%M:%S")