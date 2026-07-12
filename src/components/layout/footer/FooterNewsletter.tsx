import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { siteContent } from '@/data/siteContent';
import { FormError, inputClassName } from '@/components/ui/FormField';
import { newsletterSchema, type NewsletterFormValues } from '@/validators/schemas';

export default function FooterNewsletter() {
  const { newsletter } = siteContent.footer;
  const [subscribed, setSubscribed] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormValues>({
    resolver: yupResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = () => {
    setSubscribed(true);
    reset();
  };

  return (
    <div className="footerarea__newsletter__wraper">
      <div className="row">
        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" data-aos="fade-up">
          <div className="footerarea__text">
            <h3>
              {newsletter.title} <span>{newsletter.titleHighlight}</span> ?
            </h3>
            <p>{newsletter.description}</p>
          </div>
        </div>
        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" data-aos="fade-up">
          <div className="footerarea__newsletter">
            <div className="footerarea__newsletter__input">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {subscribed && <p className="form-success">Thanks for subscribing!</p>}
                <input
                  type="email"
                  placeholder={newsletter.placeholder}
                  className={inputClassName('', !!errors.email)}
                  {...register('email')}
                />
                <FormError message={errors.email?.message} />
                <div className="footerarea__newsletter__button">
                  <button type="submit" className="subscribe__btn">
                    {newsletter.buttonText}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
